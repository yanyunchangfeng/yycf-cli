import Inquirer from 'inquirer';
import { CreatoRequestService } from '../services';
import config from '../config/gitServerConfig';
import {
  wrapLoading,
  readGitServerConfig,
  writeGitServerConfig,
  logger,
  readPluginConfig,
  writePluginConfig
} from '../utils';
import { GITSERVER, Repo, PluginContext } from '../shared';
import pluginsConfig from '../config/pluginConfig';

class CreatorService {
  context: Record<string, any>;
  projectName: string;
  targetDir: string;
  destDir: any;
  constructor(context: PluginContext) {
    this.projectName = context.projectName;
    this.targetDir = context.targetDir;
    this.context = context;
  }
  async inquirerGitServerConfig() {
    const { gitServerType, gitServerConfig, gitServer } = await readGitServerConfig();
    const basePrompts = [
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
      },
      {
        name: 'type',
        type: 'list',
        choices: [GITSERVER.GITHUB, GITSERVER.GITLAB],
        default: gitServerType,
        message: `please choose your ${gitServer} type:`
      }
    ];
    const { Authorization, origin, type } = await Inquirer.prompt(basePrompts as any);
    if (type === GITSERVER.GITHUB) {
      const gitHubExtraPrompts = [
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
      ];
      const { orgs, user } = await Inquirer.prompt(gitHubExtraPrompts as any);
      if (!origin || !Authorization || !(orgs || user)) return;
      config.set(`gitServers.${gitServer}`, {
        ...gitServerConfig,
        origin,
        Authorization,
        type,
        orgs,
        user
      });
      config.set('defaults.gitServerConfigured', true);
      return await writeGitServerConfig();
    }
    if (!origin || !Authorization) return;
    config.set(`gitServers.${gitServer}`, {
      ...gitServerConfig,
      origin,
      Authorization,
      type
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
  async fetchTemplate() {
    const repo = await this.fetchRepo();
    if (!repo) return;
    const tag = await this.fetchTag(repo);
    this.context.repo = repo;
    this.context.tag = tag;
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
    const { plugins, requiredPlugins } = await readPluginConfig();
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
        loop: false,
        choices: pluginList
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
  }
}
export default CreatorService;
