import Inquirer from 'inquirer';
import { CreatoRequestService } from '../services';
import config from '../config/dbConfig';
import { wrapLoading, readFile, writeFile, readConfig, copy, writeConfig } from '../utils';
import util from 'util';
// @ts-ignore   正常不用忽略也没问题 因为typings里面有定义  主要是为了解决调式模式下的ts报错（调式编译器的问题）
import dowloadGitRepo from 'download-git-repo';
import path from 'path';
import { SetUpService } from '.';
import { GITSERVER, Repo } from '../shared';
import os from 'os';
import fs from 'fs-extra';

class CreatorService {
  projectName: string;
  targetDir: string;
  downloadGitRepo = util.promisify(dowloadGitRepo);
  setUpService: SetUpService;
  cacheDir: any;
  destDir: any;
  constructor(projectName: string, targetDir: string) {
    this.projectName = projectName;
    this.targetDir = targetDir;
    this.setUpService = new SetUpService(targetDir);
    this.initCacheDir();
  }
  async initCacheDir() {
    const plaform = os.platform();
    if (plaform === 'linux') {
      this.cacheDir = '/var/cache/repository'; // 替换为实际的缓存目录
    } else if (plaform === 'darwin') {
      this.cacheDir = '/Library/Caches/repository'; // 替换为实际的缓存目录
    } else if (plaform === 'win32') {
      const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
      this.cacheDir = path.join(appData, 'repository'); // 替换为实际的缓存目录
    } else {
      throw new Error('不支持的操作系统');
    }
  }
  async inquirerGitServerConfig() {
    const { gitServerType, gitServerConfig, gitServer } = await readConfig();
    const prompt = [
      {
        name: 'origin',
        type: 'input',
        default: gitServerConfig.origin,
        message: `please input your ${gitServer} protocal hostname:`
      },
      {
        name: 'Authorization',
        type: 'input',
        default: gitServerConfig.Authorization,
        message: `please input your ${gitServer} personal access tokens:`
      }
    ];
    if (gitServerType === GITSERVER.GITHUB) {
      prompt.push(
        {
          name: 'orgs',
          type: 'input',
          default: gitServerConfig.orgs,
          message: `please input your ${gitServer} orgs:`
        },
        {
          name: 'user',
          type: 'input',
          default: gitServerConfig.user,
          message: `please input your ${gitServer} user:`
        }
      );
    }
    const { Authorization, origin, orgs, user } = await Inquirer.prompt(prompt as any);
    if (gitServerType === GITSERVER.GITHUB) {
      if (!origin || !Authorization || !(orgs || user)) return;
    }
    if (!origin || !Authorization) return;
    config.set(`gitServers.${gitServer}`, {
      ...gitServerConfig,
      origin,
      Authorization,
      orgs: orgs ?? gitServerConfig.orgs,
      user: user ?? gitServerConfig.user
    });
    // config.set('defaults.gitServerConfigured', true);
    await writeConfig();
  }
  async fetchRepo() {
    let { gitServerType } = await readConfig();
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
    const { gitServerType } = await readConfig();
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
  async cacheRepository(repo: Repo, tag: string) {
    const { gitServerType, origin, orgs, user, Authorization } = await readConfig();
    await fs.ensureDir(this.cacheDir);
    let requestUrl;
    if (gitServerType !== GITSERVER.GITHUB) {
      requestUrl = `direct:${origin}/api/v4/projects/${repo.id}/repository/archive.zip${tag ? `?sha=${tag}` : ''} `;
      return await wrapLoading(this.downloadGitRepo, 'waiting for download ', requestUrl, this.destDir, {
        headers: { Authorization: `Bearer ${Authorization}` }
      });
    }
    if (gitServerType === GITSERVER.GITHUB) {
      requestUrl = `${orgs ? orgs : user}/${repo.name}${tag ? '#' + tag : ''}`;
    }
    return await wrapLoading(this.downloadGitRepo, 'waiting for download ', requestUrl, this.destDir);
  }
  async copyFromCacheResponsitory() {
    await copy(this.destDir, this.targetDir);
  }
  async isDestDirCached() {
    return fs.existsSync(this.destDir);
  }
  async fetchTemplate() {
    const repo = await this.fetchRepo();
    if (!repo) return;
    const tag = await this.fetchTag(repo);
    this.destDir = path.join(this.cacheDir, `${repo.name}${tag ? `@${tag}` : ''}`);
    const isDestDirCached = await this.isDestDirCached();
    if (isDestDirCached) {
      return await this.copyFromCacheResponsitory();
    }
    await this.cacheRepository(repo, tag);
    return await this.copyFromCacheResponsitory();
  }
  async writePkg() {
    const pkgPath = path.join(this.targetDir, 'package.json');
    let pInfo: any = await readFile(pkgPath, true);
    if (!pInfo) return;
    pInfo.name = this.projectName;
    await writeFile(pkgPath, pInfo, true);
  }
  async inquirerNewGitServer() {
    const { gitServerList } = await readConfig();
    const { gitServer } = await Inquirer.prompt([
      {
        type: 'input',
        name: 'gitServer',
        message: 'please input your git server name:',
        validate: (input: string) => {
          if (input === '') {
            return 'git server name is required';
          }
          if (gitServerList.includes(input)) {
            return 'git server name is already exists';
          }
          return true;
        }
      }
    ] as any);
    const basePrompts = [
      {
        name: 'origin',
        type: 'input',
        message: `please input your ${gitServer} protocal hostname:`
      },
      {
        name: 'Authorization',
        type: 'input',
        message: `please input your ${gitServer} personal access tokens:`
      },
      {
        name: 'type',
        type: 'list',
        choices: [GITSERVER.GITHUB, GITSERVER.GITLAB],
        message: `please choose your ${gitServer} type:`
      }
    ];
    const gitHubExtraPrompts = [
      {
        name: 'orgs',
        type: 'input',
        message: `please input your ${gitServer} orgs:`
      },
      {
        name: 'user',
        type: 'input',
        message: `please input your ${gitServer} user:`
      }
    ];
    const { Authorization, origin, type, orgs = '', user = '' } = await Inquirer.prompt(basePrompts as any);
    const result = {
      origin,
      Authorization,
      type,
      orgs,
      user
    };
    if (type === GITSERVER.GITHUB) {
      const { orgs, user } = await Inquirer.prompt(gitHubExtraPrompts as any);
      config.set(`gitServers.${gitServer}`, {
        ...result,
        orgs,
        user
      });
    }
    config.set(`gitServers.${gitServer}`, result);
    await writeConfig();
  }
  async inquirerChooseGitServer() {
    const { gitServerList } = await readConfig();
    const { gitServer } = await Inquirer.prompt([
      {
        name: 'gitServer',
        type: 'list',
        choices: gitServerList,
        message: 'please choose a git server:'
      }
    ] as any);
    config.set('defaults.defaultGitServer', gitServer);
    await writeConfig();
  }
  async inquireDeleteGitServer() {
    const { gitServerList } = await readConfig();
    if (!gitServerList.length) {
      return;
    }
    const { gitServer } = await Inquirer.prompt([
      {
        name: 'gitServer',
        type: 'list',
        choices: gitServerList,
        message: 'please choose a git server to delete:'
      }
    ] as any);
    const { confirmDelete } = await Inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmDelete',
        message: `are you sure to delete ${gitServer}?`,
        default: false
      }
    ] as any);
    if (confirmDelete) {
      const origin: any = config.getProperties();
      delete origin.gitServers[gitServer];
      config.set('gitServers', origin.gitServers);
      await writeConfig();
    }
  }
  async promptUserOption() {
    const { option } = await Inquirer.prompt([
      {
        name: 'option',
        type: 'list',
        choices: ['chooseGitServer', 'newGitServer', 'deleteGitServer'],
        message: 'please choose an option'
      }
    ] as any);
    switch (option) {
      case 'chooseGitServer':
        await this.inquirerChooseGitServer();
        await this.inquirerGitServerConfig();
        return;
      case 'newGitServer':
        await this.inquirerNewGitServer();
        break;
      case 'deleteGitServer':
        await this.inquireDeleteGitServer();
        break;
    }
    await this.promptUserOption();
  }
  async initGitServer() {
    if (config.get('defaults.gitServerConfigured')) return;
    await this.promptUserOption();
  }
  async create() {
    await this.initGitServer();
    await this.fetchTemplate();
    await this.writePkg();
  }
}
export default CreatorService;
