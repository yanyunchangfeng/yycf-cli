import { PluginContext, resourcePublicServerPath, ServerParams } from '../shared';
import express from 'express';
import { logger, copy, readFile, writeFile } from '../utils';
import Handlebars from 'handlebars';
import path from 'path';
import http from 'http';
import open from 'open';

class ServerService {
  context;
  app = express();
  basePort = 3000;
  server?: http.Server;
  serverParams: ServerParams;
  filters = ['.hbs', '.ts'];
  constructor(context: PluginContext, serverParams: ServerParams) {
    this.context = context;
    this.serverParams = serverParams;
  }
  init() {
    this.app.use(express.static(path.join(this.context.targetDir, this.serverParams.reportPath)));
  }
  async startServer() {
    this.init();
    try {
      const port = await this.findAvailablePort(this.basePort);
      this.server = this.app.listen(port, async () => {
        logger.info(
          `${this.getRepoTitle()} ${this.serverParams.staticPath} server running at http://localhost:${port}`
        );
        open(`http://localhost:${port}`);
      });
    } catch (err) {
      logger.error(` Error  ${this.getRepoTitle()} ${this.serverParams.staticPath} finding available port: ${err}`);
    } finally {
      if (this.context.exit) {
        this.stopServer();
      }
    }
  }
  async stopServer() {
    if (this.server) {
      this.server.close(() => {
        logger.info(`${this.getRepoTitle()} ${this.serverParams.staticPath} Server stopped.`);
      });
    }
  }
  async findAvailablePort(port: number): Promise<number> {
    return new Promise((resolve, reject) => {
      const testServer = http.createServer();
      testServer.listen(port);
      testServer.on('listening', () => {
        testServer.close();
        resolve(port);
      });
      testServer.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          resolve(this.findAvailablePort(port + 1));
        } else {
          reject(err);
        }
      });
    });
  }
  getRepoTitle() {
    return `${this.serverParams.repo?.name}${this.serverParams.repo?.tag ? `@${this.serverParams.repo.tag}` : ''}`;
  }
  async generateHTML() {
    try {
      // 读取 Handlebars 模板文件
      const templatePath = path.join(resourcePublicServerPath, this.serverParams.staticPath, 'index.hbs');
      const templateContent = await readFile(templatePath);
      // 编译模板
      const template = Handlebars.compile(templateContent);
      // 生成 HTML 内容
      const htmlContent = template({
        title: this.getRepoTitle()
      });
      // 输出到文件
      const outputPath = path.join(this.context.targetDir, this.serverParams.reportPath, 'index.html');
      await writeFile(outputPath, htmlContent);
      logger.info(
        `generated ${this.getRepoTitle()} ${this.serverParams.staticPath} HTML file successfully at ${outputPath}`
      );
    } catch (error) {
      logger.error(`Error generating ${this.getRepoTitle()} ${this.serverParams.staticPath} HTML: ${error}`);
    }
  }
  filter = (src: string, dest: string) => {
    if (this.filters.find((filter) => src.includes(filter))) {
      return false;
    }
    return true;
  };
  async copyServerStatic() {
    const originPath = path.join(resourcePublicServerPath, this.serverParams.staticPath);
    const targetPath = path.join(this.context.targetDir, this.serverParams.reportPath);
    await copy(originPath, targetPath, { filter: this.filter });
  }
}

export default ServerService;
