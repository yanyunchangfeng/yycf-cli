import Inquirer from 'inquirer';
import { CreatoRequestService, dbService } from '.';
import { wrapLoading } from '../utils';
import { GITSERVER, Repo, PluginContext } from '../shared';

class CreatorService {
  context;
  constructor(context: PluginContext) {
    this.context = context;
  }
  async fetchRepo() {
    let { gitServerType } = await dbService.readGitServerConfig();
    let repos: any = await wrapLoading(
      CreatoRequestService[gitServerType as GITSERVER].fetchRepoList,
      'waiting for fetch template'
    );
    if (!repos?.length) return;
    repos = repos.map((item: any) => {
      return {
        name: item.name,
        value: item.id
      };
    });
    if (this.context.all) {
      // 批量操作
      return repos.map((item: any) => {
        return {
          name: item.name,
          id: item.value
        };
      });
    } else {
      const { repo } = await Inquirer.prompt({
        name: 'repo',
        type: 'list',
        choices: repos,
        loop: false,
        message: `please choose a template to create project:`
      } as any);
      return [{ name: repos.find((item: any) => item.value === repo).name, id: repo }];
    }
  }
  async fetchTag(repo: Repo) {
    const { gitServerType } = await dbService.readGitServerConfig();
    const tags = await wrapLoading(
      CreatoRequestService[gitServerType as GITSERVER].fetchTagList,
      `waiting fetch ${repo.name} tag `,
      repo
    );
    if (!tags?.length) return;
    if (this.context.all) {
      // 批量操作
      return tags[0].name;
    } else {
      const { tag } = await Inquirer.prompt({
        name: 'tag',
        type: 'list',
        choices: tags,
        loop: false,
        message: 'please choose a tag to create project:'
      } as any);
      return tag;
    }
  }
  async fetchTemplate() {
    const repos = await this.fetchRepo();
    if (!repos) return;
    const tags = await Promise.all(repos.map((repo: Repo) => this.fetchTag(repo)));
    const { ignoreRepos } = await dbService.readPluginConfig();
    this.context.repos = repos.map((repo: any, index: number) => {
      return {
        ...repo,
        tag: tags[index]
      };
    });
    if (this.context.all) {
      this.context.repos = this.context.repos.filter((repo: any) => !ignoreRepos.includes(repo.name));
    }
  }
  async init() {
    await this.fetchTemplate();
  }
}
export default CreatorService;
