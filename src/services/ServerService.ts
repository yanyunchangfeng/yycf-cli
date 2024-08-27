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
  ServerParams: ServerParams;
  filters = ['hbs'];
  constructor(context: PluginContext, serverParams: ServerParams) {
    this.context = context;
    this.ServerParams = serverParams;
  }
  init() {
    this.app.use(express.static(path.join(this.context.targetDir, this.ServerParams.reportPath)));
  }
  async startServer() {
    this.init();
    try {
      const port = await this.findAvailablePort(this.basePort);
      this.server = this.app.listen(port, () => {
        logger.info(`${this.ServerParams.staticPath} server running at http://localhost:${port}`);
        open(`http://localhost:${port}`);
      });
    } catch (err) {
      logger.error(`Error finding available port: ${err}`);
    }
  }
  async stopServer() {
    if (this.server) {
      this.server.close(() => {
        logger.info('Server stopped.');
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
  async generateHTML() {
    try {
      // 读取 Handlebars 模板文件
      const templatePath = path.join(resourcePublicServerPath, this.ServerParams.staticPath, 'index.hbs');
      const templateContent = await readFile(templatePath);
      // 编译模板
      const template = Handlebars.compile(templateContent);
      // 生成 HTML 内容
      const htmlContent = template({
        title: `${this.ServerParams.repo?.name}${this.ServerParams.repo?.tag ? `@${this.ServerParams.repo.tag}` : ''}`
      });
      // 输出到文件
      const outputPath = path.join(this.context.targetDir, this.ServerParams.reportPath, 'index.html');
      await writeFile(outputPath, htmlContent);
      logger.info(`${this.ServerParams.staticPath} HTML file generated successfully at ${outputPath}`);
    } catch (error) {
      logger.error(`Error generating ${this.ServerParams.staticPath} HTML: ${error}`);
    }
  }
  filter = (src: string, dest: string) => {
    if (this.filters.find((filter) => src.includes(filter))) {
      return false;
    }
    return true;
  };
  async copyServerStatic() {
    const originPath = path.join(resourcePublicServerPath, this.ServerParams.staticPath);
    const targetPath = path.join(this.context.targetDir, this.ServerParams.reportPath);
    await copy(originPath, targetPath, { filter: this.filter });
  }
}

export default ServerService;
