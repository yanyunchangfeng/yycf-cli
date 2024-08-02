class SetUpService {
  root: string;
  constructor(root: string) {
    this.root = root;
  }
  async execGetOutput(command: string, args: any[], description: string) {
    console.log(`Setup: ${description}`);
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
    console.log(`setup: ${description}`);
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
  async installYarnAsync() {
    return await this.exec('npm', ['install', '-g', 'yarn'], 'Install yarn');
  }
  async ensureYarnInstalledAsync() {
    const semverPattern =
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(\.(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(\+[0-9a-zA-Z-]+(\.[0-9a-zA-Z-]+)*)?$/;
    let hasYarn = false;
    try {
      const stdout: any = await this.execGetOutput('yarn', ['-v'], 'Check yarn version');
      hasYarn = semverPattern.test(stdout);
    } catch (e) {
      hasYarn = false;
    }
    if (!hasYarn) await this.installYarnAsync();
  }
  async setup() {
    await this.ensureYarnInstalledAsync();
  }
}

export default SetUpService;
