import { logger } from '../utils';

class SetUpService {
  root: string;
  constructor(root: string = process.cwd()) {
    this.root = root;
  }
  async execGetOutput(command: string, args: any[], description: string) {
    logger.info(`Setup: ${description}`);
    logger.info(`${command} ${args.join(' ')}`);
    return new Promise((resolve, reject) => {
      let cp = require('child_process').spawn(command, args, {
        cwd: this.root,
        stdio: [process.stdin, 'pipe', process.stderr],
        shell: true
      });
      cp.on('error', (error: any) => {
        reject(new Error(`${description} failed with ${error}`));
      });
      cp.on('exit', (exitCode: number) => {
        if (exitCode) {
          reject(`${description} failed with exit code ${exitCode}`);
        } else {
          resolve(Buffer.concat(buffers).toString('utf-8').trim());
        }
      });
      const buffers: any[] = [];
      cp.stdout.on('data', (data: any) => buffers.push(data));
    });
  }
  async exec(command: string, args: any[], description: any) {
    logger.info(`setup: ${description}`);
    logger.info(`${command} ${args.join(' ')}`);
    return new Promise((resolve, reject) => {
      let cp = require('child_process').spawn(command, args, {
        cwd: this.root,
        stdio: 'inherit',
        shell: true
      });
      cp.on('error', (error: any) => {
        reject(new Error(`${description} failed with ${error}`));
      });
      cp.on('exit', (exitCode: any) => {
        if (exitCode) {
          reject(`${description} failed with code ${exitCode}`);
        } else {
          resolve(1);
        }
      });
    });
  }
  async installPkgAsync(pkg: string) {
    return await this.exec('npm', ['install', '-g', pkg], `Install ${pkg}`);
  }
  async ensurePkgInstalledAsync(pkg: string) {
    const semverPattern =
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(\.(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(\+[0-9a-zA-Z-]+(\.[0-9a-zA-Z-]+)*)?$/;
    let hasPkg = false;
    try {
      const stdout: any = await this.execGetOutput(pkg, ['--version'], `Check ${pkg} version`);
      hasPkg = semverPattern.test(stdout);
    } catch (e) {
      hasPkg = false;
    }
    if (!hasPkg) await this.installPkgAsync(pkg);
  }
  async setup(pkg: string) {
    await this.ensurePkgInstalledAsync(pkg);
  }
  async ensurePkgInstalledGlobal(pkg: string) {
    let hasPkg = false;
    const reg = new RegExp(`(^|\\s)(@?${pkg})@([0-9]+(?:\\.[0-9]+)*(?:\\.[0-9]+)?)(-[a-zA-Z0-9-]+)?`, 'm');
    try {
      const stdout: any = await this.execGetOutput('npm', ['list', '-g', '--depth=0'], `Check ${pkg} installed`);
      const match: any = stdout.match(reg);
      if (match) {
        hasPkg = true;
        logger.info(`${pkg} installed global, version : ${match[3]}`);
      }
    } catch (e) {
      hasPkg = false;
    }
    if (!hasPkg) await this.installPkgAsync(pkg);
  }
}

export default SetUpService;
