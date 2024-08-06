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
    // 根据操作系统选择缓存目录
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

    config.set(`gitServers${gitServer}`, {
      origin,
      Authorization,
      orgs,
      user
    });
    config.set('defaults.gitServerConfigured', true);
    await writeConfig();
  }
  async inquirerGitServerList() {
    const { gitServerList, gitServer: defaultGitServer } = await readConfig();
    const { gitServer } = await Inquirer.prompt([
      {
        name: 'gitServer',
        type: 'list',
        default: defaultGitServer,
        choices: gitServerList,
        message: 'please choose your git server:'
      }
    ] as any);
    config.set('defaults.defaultGitServer', gitServer);
    await writeConfig();
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
    await this.inquirerGitServerList();
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
