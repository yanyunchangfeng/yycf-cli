import Inquirer from 'inquirer';
import { logger } from '../utils';
import { GITSERVER, PluginContext } from '../shared';
import { dbService } from '../services';

class PromptService {
  context;
  constructor(context: PluginContext) {
    this.context = context;
  }
  async inquirerGitServerConfig() {
    const { gitServerType, gitServerConfig, gitServer } = await dbService.readGitServerConfig();
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
        choices: [GITSERVER.GITLAB, GITSERVER.GITHUB],
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
      dbService.gitServerConfigDb.set(`gitServers.${gitServer}`, {
        ...gitServerConfig,
        origin,
        Authorization,
        type,
        orgs,
        user
      });
      dbService.gitServerConfigDb.set('defaults.gitServerConfigured', true);
      return await dbService.writeGitServerConfig();
    }
    if (!origin || !Authorization) return;
    dbService.gitServerConfigDb.set(`gitServers.${gitServer}`, {
      ...gitServerConfig,
      origin,
      Authorization,
      type
    });
    dbService.gitServerConfigDb.set('defaults.gitServerConfigured', true);
    await dbService.writeGitServerConfig();
  }
  async inquirerNewGitServer() {
    const { gitServerList } = await dbService.readGitServerConfig();
    const { gitServer } = await Inquirer.prompt([
      {
        type: 'input',
        name: 'gitServer',
        message: 'please input your git server name:',
        validate: (input: string) => {
          if (input.trim() === '') {
            return 'git server name cannot be empty or consist only of whitespace';
          }
          if (gitServerList.includes(input)) {
            return 'git server name is already exists';
          }
          return true;
        },
        required: true
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
        choices: [GITSERVER.GITLAB, GITSERVER.GITHUB],
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
      dbService.gitServerConfigDb.set(`gitServers.${gitServer}`, {
        ...result,
        orgs,
        user
      });
    }
    dbService.gitServerConfigDb.set(`gitServers.${gitServer}`, result);
    await dbService.writeGitServerConfig();
  }
  async inquirerChooseGitServer() {
    const { gitServerList, gitServer: defaultGitServer } = await dbService.readGitServerConfig();
    const { gitServer } = await Inquirer.prompt([
      {
        name: 'gitServer',
        type: 'list',
        choices: gitServerList,
        default: defaultGitServer,
        message: 'please choose a git server:'
      }
    ] as any);
    dbService.gitServerConfigDb.set('defaults.defaultGitServer', gitServer);
    await dbService.writeGitServerConfig();
  }
  async inquireDeleteGitServer() {
    const { gitServerList, gitServer: defaultGitServer } = await dbService.readGitServerConfig();
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

    const gitServerConfig: any = await dbService.readGitServerConfigAll();
    delete gitServerConfig.gitServers[gitServer];
    dbService.gitServerConfigDb.set('gitServers', gitServerConfig.gitServers);
    if (defaultGitServer === gitServer) {
      dbService.gitServerConfigDb.set('defaults.defaultGitServer', '');
    }
    await dbService.writeGitServerConfig();
  }
  async inquirerChoosePluginsEnabled() {
    const { plugins, requiredPlugins, disabledPlugins } = await dbService.readPluginConfig();
    const pluginList = plugins
      .filter((plugin) => !disabledPlugins.includes(plugin.name))
      .map((plugin) => {
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
    dbService.pluginConfigDb.set('plugins', newPlugins);
    await dbService.writePluginConfig();
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
        if (dbService.gitServerConfigDb.get('defaults.gitServerConfigured')) return;
        await this.inquirerGitServerConfig();
        return;
      case 'newGitServer':
        await this.inquirerNewGitServer();
        break;
      case 'deleteGitServer':
        await this.inquireDeleteGitServer();
        break;
      case 'resetGitServerConfigured':
        dbService.gitServerConfigDb.set('defaults.gitServerConfigured', false);
        await dbService.writeGitServerConfig();
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
  async init() {
    await this.initGitServer();
  }
}
export default PromptService;
