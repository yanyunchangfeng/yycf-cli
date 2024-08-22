import Inquirer from 'inquirer';
import { CreatoRequestService } from '.';
import { wrapLoading, readGitServerConfig } from '../utils';
import { GITSERVER, Repo, PluginContext } from '../shared';

class CreatorService {
  context;
  constructor(context: PluginContext) {
    this.context = context;
  }
  async fetchRepo() {
    let { gitServerType } = await readGitServerConfig();
    let repos: any = await wrapLoading(
      CreatoRequestService[gitServerType as GITSERVER].fetchRepoList,
      'waiting for fetch template'
    );
    if (!repos) return;
    repos = repos.map((item: any) => {
      return {
        name: item.name,
        value: item.id
      };
    });
    const { repo } = await Inquirer.prompt({
      name: 'repo',
      type: 'list',
      choices: repos,
      loop: false,
      message: `please choose a template to create project:`
    } as any);
    return { name: repos.find((item: any) => item.value === repo).name, id: repo };
  }
  async fetchTag(repo: Repo) {
    const { gitServerType } = await readGitServerConfig();
    const tags = await wrapLoading(
      CreatoRequestService[gitServerType as GITSERVER].fetchTagList,
      'waiting fetch tag',
      repo
    );
    if (!tags?.length) return;
    const { tag } = await Inquirer.prompt({
      name: 'tag',
      type: 'list',
      choices: tags,
      loop: false,
      message: 'please choose a tag to create project:'
    } as any);
    return tag;
  }
  async fetchTemplate() {
    const repo = await this.fetchRepo();
    if (!repo) return;
    const tag = await this.fetchTag(repo);
    this.context.repo = repo;
    this.context.tag = tag;
  }
  async init() {
    await this.fetchTemplate();
  }
}
export default CreatorService;
