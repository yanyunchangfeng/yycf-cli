import Inquirer from 'inquirer';
import { CreatoRequestService } from '../services';
import { wrapLoading, readFile, writeFile, readConfig, copy, config, writeConfig } from '../utils';
import util from 'util';
// @ts-ignore   正常不用忽略也没问题 因为typings里面有定义  主要是为了解决调式模式下的ts报错（调式编译器的问题）
import dowloadGitRepo from 'download-git-repo';
import path from 'path';
import { SetUpService } from '.';
import { GITSERVER, Repo } from '../shared';
import os from 'os';
import fs from 'fs-extra';
import { startServer, stopServer } from '../server';

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
  async copyEslintConfig() {
    const originPath = path.resolve(__dirname, '../resources/extensions/eslint/eslint.config.mjs');
    const targetPath = path.join(this.targetDir, 'eslint.config.mjs');
    await copy(originPath, targetPath);
  }
  async installEslintDependencies() {
    const { eslintPkgs } = await readConfig();
    const command = ['add', ...eslintPkgs, '-D'].join(' ');
    await this.setUpService.exec('yarn', [command], 'Installing eslint dependencies ');
  }
  // async genertingReportHtml() {
  //   await this.setUpService.exec(
  //     'yarn',
  //     ['eslint -f html -o ./report/index.html || true'],
  //     'generating eslint reporter html'
  //   );
  // }
  async generatorReportJson() {
    await this.setUpService.exec(
      'yarn',
      ['eslint -f json -o eslint-report.json || true'],
      'generating eslint reporter json'
    );
  }
  async copyLocalStaticHtml() {
    const originPath = path.resolve(__dirname, '../resources/public/local/index.html');
    const targetPath = path.join(this.targetDir, 'index.html');
    await copy(originPath, targetPath);
  }
  async generatorEslintReport() {
    await this.copyEslintConfig();
    await this.installEslintDependencies();
    // await this.genertingReportHtml();
    await this.generatorReportJson();
    await this.copyLocalStaticHtml();
    await stopServer();
    await startServer(this.targetDir);
  }
  async inquirerEslintReport() {
    const { action } = await Inquirer.prompt({
      name: 'action',
      type: 'list',
      choices: ['No', 'Yes'],
      message: 'please choose generator eslint report:'
    } as any);
    if (action === 'Yes') {
      await this.generatorEslintReport();
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
    config.set('defaults.gitServerConfigured', true);
    await writeConfig();
  }
  async inquirerNewGitServer(gitServer: string) {
    const prompts = [
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
      },
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
    const { Authorization, origin, orgs, user, type } = await Inquirer.prompt(prompts as any);
    config.set(`gitServers.${gitServer}`, {
      origin,
      Authorization,
      orgs,
      user,
      type
    });
    await writeConfig();
  }
  async promptUser() {
    const { gitServerList } = await readConfig();
    const { option } = await Inquirer.prompt([
      {
        name: 'option',
        type: 'list',
        choices: [...gitServerList, 'newGitServer'],
        message: 'please choose an option'
      }
    ] as any);
    if (option === 'newGitServer') {
      const { gitServer } = await Inquirer.prompt([
        {
          type: 'input',
          name: 'gitServer',
          message: 'please input your git server name:'
        }
      ] as any);
      await this.inquirerNewGitServer(gitServer);
      await this.promptUser();
    }
    if (option !== 'newGitServer') {
      config.set('defaults.defaultGitServer', option);
      await writeConfig();
    }
  }
  async installDependencies() {
    await this.setUpService.exec('yarn', [], 'Installing dependencies');
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

  async setUp() {
    await this.setUpService.setup();
  }
  async writePkg() {
    const pkgPath = path.join(this.targetDir, 'package.json');
    let pInfo: any = await readFile(pkgPath, true);
    if (!pInfo) return;
    pInfo.name = this.projectName;
    await writeFile(pkgPath, pInfo, true);
  }
  async initGitServer() {
    if (config.get('defaults.gitServerConfigured')) return;
    await this.promptUser();
    await this.inquirerGitServerConfig();
  }
  async create() {
    await this.initGitServer();
    await this.fetchTemplate();
    await this.writePkg();
    await this.setUp();
    await this.inquirerEslintReport();
    await this.installDependencies();
  }
}
export default CreatorService;
