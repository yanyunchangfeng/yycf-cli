import Inquirer from 'inquirer';
import { CreatoRequestService } from '.';
import { wrapLoading, readFile, writeFile, writeConfig, readConfig } from '../utils';
import util from 'util';
// @ts-ignore   正常不用忽略也没问题 因为typings里面有定义  主要是为了解决调式模式下的ts报错（调式编译器的问题）
import dowloadGitRepo from 'download-git-repo';
import path from 'path';
import fs from 'fs-extra';
import { SetUpService } from '.';

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
    let repos: any = await wrapLoading(CreatoRequestService.fetchRepoList, 'waiting for fetch template');
    if (!repos) return;
    repos = repos.map((item: any) => {
      return item.name;
    });
    const { repo } = await Inquirer.prompt({
      name: 'repo',
      type: 'list',
      choices: repos,
      message: `please choose a template to create project:`
    } as any);
    return repo;
  }
  async fetchTag(repo: string) {
    const tags = await wrapLoading(CreatoRequestService.fetchTagList, 'waiting fetch tag', repo);
    if (!tags) return;
    const { tag } = await Inquirer.prompt({
      name: 'tag',
      type: 'list',
      choices: tags,
      message: 'please choose a tag to create project:'
    } as any);
    return tag;
  }

  async download(repo: string, tag: string) {
    const requestUrl = `yanyunchangfeng/${repo}${tag ? '#' + tag : ''}`;
    await wrapLoading(this.downloadGitRepo, 'waiting for download ', requestUrl, this.targetDir);
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
  async inquireEslint() {
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
  async inquirerConfig() {
    const { action } = await Inquirer.prompt({
      name: 'action',
      type: 'list',
      choices: ['No', 'Yes'],
      message: 'please choose config github/gitlab settings:'
    } as any);
    if (action !== 'Yes') {
      return;
    }
    const config: any = await readConfig();
    const { Authorization, orgName, apiUrl } = await Inquirer.prompt([
      {
        name: 'apiUrl',
        type: 'input',
        default: config.apiUrl,
        message: 'please input your github/gitlab protocal hostname:'
      },
      {
        name: 'orgName',
        type: 'input',
        default: config.orgName,
        message: 'please input your github/gitlab organizations:'
      },
      {
        name: 'Authorization',
        type: 'password',
        default: config.Authorization,
        message: 'please input your github/gitlab personal access tokens:'
      }
    ] as any);
    if (!Authorization && !orgName && !apiUrl) return;
    await writeConfig({
      Authorization,
      orgName,
      apiUrl
    });
  }
  async create() {
    await this.inquirerConfig();
    const repo = await this.fetchRepo();
    const tag = await this.fetchTag(repo);
    await this.download(repo, tag);
    await this.writePkg();
    await this.setUpService.setup();
    await this.inquireEslint();
    await this.installDependencies();
  }
}
export default CreatorService;
