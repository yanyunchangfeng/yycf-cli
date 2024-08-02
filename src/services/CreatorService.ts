import Inquirer from 'inquirer';
import { CreatoRequestService } from '../services';
import { wrapLoading, readFile, writeFile, writeConfig, readConfig } from '../utils';
import util from 'util';
// @ts-ignore   正常不用忽略也没问题 因为typings里面有定义  主要是为了解决调式模式下的ts报错（调式编译器的问题）
import dowloadGitRepo from 'download-git-repo';
import path from 'path';
import fs from 'fs-extra';
import { SetUpService } from '.';
import { GITSERVER, Repo } from '../shared';

class CreatorService {
  projectName: string;
  targetDir: string;
  downloadGitRepo = util.promisify(dowloadGitRepo);
  setUpService: SetUpService;
  constructor(projectName: string, targetDir: string) {
    this.projectName = projectName;
    this.targetDir = targetDir;
    this.setUpService = new SetUpService(targetDir);
  }
  async fetchRepo() {
    const config: any = await readConfig();
    let repos: any = await wrapLoading(
      CreatoRequestService[config.default as GITSERVER].fetchRepoList,
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
      message: `please choose a template to create project:`
    } as any);
    return { name: repos.find((item: any) => item.value === repo).name, id: repo };
  }
  async fetchTag(repo: Repo) {
    const config: any = await readConfig();
    const tags = await wrapLoading(
      CreatoRequestService[config.default as GITSERVER].fetchTagList,
      'waiting fetch tag',
      repo
    );
    if (!tags) return;
    const { tag } = await Inquirer.prompt({
      name: 'tag',
      type: 'list',
      choices: tags,
      message: 'please choose a tag to create project:'
    } as any);
    return tag;
  }

  async download(repo: Repo, tag: string) {
    const config: any = await readConfig();
    let requestUrl;
    if (config.default === GITSERVER.GITHUB) {
      requestUrl = `${config[config.default].orgs ? config[config.default].orgs : config[config.default].user}/${
        repo.name
      }${tag ? '#' + tag : ''}`;
    }
    if (config.default === GITSERVER.GITLAB) {
      const origin = config[config.default].origin;
      const Authorization = config[config.default].Authorization;
      requestUrl = `direct:${origin}/api/v4/projects/${repo.id}/repository/archive.zip?sha=${tag}`;
      return await wrapLoading(this.downloadGitRepo, 'waiting for download ', requestUrl, this.targetDir, {
        headers: { Authorization: `Bearer ${Authorization}` }
      });
    }
    return await wrapLoading(this.downloadGitRepo, 'waiting for download ', requestUrl, this.targetDir);
  }

  async writePkg() {
    const pkgPath = path.join(this.targetDir, 'package.json');
    let pInfo: any = await readFile(pkgPath);
    if (!pInfo) return;
    pInfo.name = this.projectName;
    await writeFile(pkgPath, pInfo);
  }
  async copyEslintConfig() {
    const originPath = path.resolve(__dirname, '../config/eslint.config.mjs');
    const targetPath = path.join(this.targetDir, 'eslint.config.mjs');
    await fs.copyFile(originPath, targetPath);
  }
  async installEslintDependencies() {
    await this.setUpService.exec(
      'yarn',
      ['add eslint globals @eslint/js typescript-eslint eslint-plugin-react -D'],
      'Installing eslint dependencies '
    );
  }
  async genertingReport() {
    await this.setUpService.exec(
      'yarn',
      ['eslint -f html -o ./report/index.html || true'],
      'generating eslint reporter'
    );
  }
  async generatorEslintReport() {
    await this.copyEslintConfig();
    await this.installEslintDependencies();
    await this.genertingReport();
  }
  async inquirerEslint() {
    const { action } = await Inquirer.prompt({
      name: 'action',
      type: 'list',
      choices: ['No', 'Yes'],
      message: 'please choose generator eslint reporter:'
    } as any);

    if (action === 'Yes') {
      await this.generatorEslintReport();
    }
  }
  async installDependencies() {
    await this.setUpService.exec('yarn', [], 'Installing dependencies');
  }
  async inquirerGitServerConfig() {
    const config: any = await readConfig();
    const gitServerList = Object.keys(config).filter((item: string) => item !== 'default');
    const { gitServer } = await Inquirer.prompt([
      {
        name: 'gitServer',
        type: 'list',
        default: config.default,
        choices: gitServerList,
        message: 'please choose your git server:'
      }
    ] as any);

    const orgSetting = config[gitServer];

    const { Authorization, user, origin, orgs } = await Inquirer.prompt([
      {
        name: 'origin',
        type: 'input',
        default: orgSetting.origin,
        message: `please input your ${gitServer} protocal hostname:`
      },
      {
        name: 'user',
        type: 'input',
        default: orgSetting.user,
        message: `please input your ${gitServer} user:`
      },
      {
        name: 'orgs',
        type: 'input',
        default: orgSetting.orgs,
        message: `please input your ${gitServer} orgs:`
      },
      {
        name: 'Authorization',
        type: 'input',
        default: orgSetting.Authorization,
        message: `please input your ${gitServer} personal access tokens:`
      }
    ] as any);
    if (!Authorization && !user && !origin && !orgs) return;
    await writeConfig({
      ...config,
      [gitServer]: {
        origin,
        user,
        Authorization,
        orgs
      },
      default: gitServer
    });
  }
  async fetchTemplate() {
    const repo = await this.fetchRepo();
    if (!repo) return;
    const tag = await this.fetchTag(repo);
    await this.download(repo, tag);
  }
  async create() {
    await this.inquirerGitServerConfig();
    await this.fetchTemplate();
    await this.writePkg();
    await this.setUpService.setup();
    await this.inquirerEslint();
    await this.installDependencies();
  }
}
export default CreatorService;
