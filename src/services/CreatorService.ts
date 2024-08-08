import Inquirer from 'inquirer';
import { CreatoRequestService, CacheRepositoryService } from '../services';
import config from '../config/gitServerConfig';
import {
  wrapLoading,
  readFile,
  writeFile,
  readGitServerConfig,
  copy,
  writeGitServerConfig,
  logger,
  readPluginConfig,
  writePluginConfig
} from '../utils';
import path from 'path';
import { SetUpService } from '.';
import { GITSERVER, Repo } from '../shared';
import fs from 'fs-extra';
import pluginsConfig from '../config/pluginConfig';

class CreatorService {
  projectName: string;
  targetDir: string;
  setUpService: SetUpService;
  destDir: any;
  cacheRepositoryService: CacheRepositoryService;
  constructor(projectName: string, targetDir: string) {
    this.projectName = projectName;
    this.targetDir = targetDir;
    this.setUpService = new SetUpService(targetDir);
    this.cacheRepositoryService = new CacheRepositoryService();
  }

  async inquirerGitServerConfig() {
    const { gitServerType, gitServerConfig, gitServer } = await readGitServerConfig();
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
    config.set('defaults.gitServerConfigured', true);
    await writeGitServerConfig();
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
    this.destDir = path.join(this.cacheRepositoryService.cacheDir, `${repo.name}${tag ? `@${tag}` : ''}`);
    const isDestDirCached = await this.isDestDirCached();
    if (isDestDirCached) {
      return await this.copyFromCacheResponsitory();
    }
    await this.cacheRepositoryService.cacheRepository(repo, tag);
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
    const { gitServerList } = await readGitServerConfig();
    const { gitServer } = await Inquirer.prompt([
      {
        type: 'input',
        name: 'gitServer',
        message: 'please input your git server name:',
        validate: (input: string) => {
          if (input.trim() === '') {
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
    await writeGitServerConfig();
  }
  async inquirerChooseGitServer() {
    const { gitServerList, gitServer: defaultGitServer } = await readGitServerConfig();
    const { gitServer } = await Inquirer.prompt([
      {
        name: 'gitServer',
        type: 'list',
        choices: gitServerList,
        default: defaultGitServer,
        message: 'please choose a git server:'
      }
    ] as any);
    config.set('defaults.defaultGitServer', gitServer);
    await writeGitServerConfig();
  }
  async inquireDeleteGitServer() {
    const { gitServerList } = await readGitServerConfig();
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
    if (!confirmDelete) return;
    if (gitServerList.length === 1) {
      logger.warn('can not delete the last git server');
      return;
    }
    const gitServerConfig: any = config.getProperties();
    delete gitServerConfig.gitServers[gitServer];
    config.set('gitServers', gitServerConfig.gitServers);
    await writeGitServerConfig();
  }
  async inquirerChoosePluginsEnabled() {
    const plugins = await readPluginConfig();
    const requiredPlugins = ['loadConfig', 'createProject', 'setUpYarn'];
    const pluginList = plugins.map((plugin) => {
      return {
        name: plugin.name,
        value: plugin.name,
        checked: plugin.enabled,
        disabled: requiredPlugins.includes(plugin.name)
      };
    });
    const { choosePlugins } = await Inquirer.prompt([
      {
        type: 'checkbox',
        name: 'choosePlugins',
        choices: pluginList
        // validate: (choices: any[]) => {
        //   choices = choices.map((choice) => choice.name);
        //   if (!choices.includes('clearCacheRepository')) return `You must required plugin clearCacheRepository `;
        // }
      }
    ] as any);
    const newPlugins: any = plugins.map((plugin) => {
      if ([...requiredPlugins, ...choosePlugins].includes(plugin.name)) {
        return { ...plugin, enabled: true };
      }
      return { ...plugin, enabled: false };
    });
    pluginsConfig.set('plugins', newPlugins);
    await writePluginConfig();
  }
  async promptUserOption() {
    const { option } = await Inquirer.prompt([
      {
        name: 'option',
        type: 'list',
        choices: [
          'chooseGitServer',
          'newGitServer',
          'deleteGitServer',
          'resetGitServerConfigured',
          'choosePluginsEnabled'
        ],
        message: 'please choose an option'
      }
    ] as any);
    switch (option) {
      case 'chooseGitServer':
        await this.inquirerChooseGitServer();
        if (config.get('defaults.gitServerConfigured')) return;
        await this.inquirerGitServerConfig();
        return;
      case 'newGitServer':
        await this.inquirerNewGitServer();
        break;
      case 'deleteGitServer':
        await this.inquireDeleteGitServer();
        break;
      case 'resetGitServerConfigured':
        config.set('defaults.gitServerConfigured', false);
        await writeGitServerConfig();
        break;
      case 'choosePluginsEnabled':
        await this.inquirerChoosePluginsEnabled();
        break;
    }
    await this.promptUserOption();
  }
  async initGitServer() {
    await this.promptUserOption();
  }
  async create() {
    await this.initGitServer();
    await this.fetchTemplate();
    await this.writePkg();
  }
}
export default CreatorService;
