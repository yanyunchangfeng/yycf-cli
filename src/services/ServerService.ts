import { PluginContext, resourcePublicServerPath, ServerParams } from '../shared';
import express from 'express';
import { logger, copy } from '../utils';
import path from 'path';
import http from 'http';
import open from 'open';

class ServerService {
  context;
  app = express();
  basePort = 3000;
  server?: http.Server;
  ServerParams: ServerParams;
  constructor(context: PluginContext, serverParams: ServerParams) {
    this.context = context;
    this.ServerParams = serverParams;
  }
  init() {
    this.app.use(express.static(path.join(this.context.targetDir, this.ServerParams.reportPath)));
  }
  async startServer() {
    this.init();
    // this.app.get('/report', async (req, res) => {
    //   const reportPath = path.join(this.context.targetDir, this.ServerParams.reportPath, 'report.json');
    //   try {
    //     const data = await readFile(reportPath, true);
    //     res.json(data);
    //   } catch (err) {
    //     res.status(500).send(`Error reading ${this.ServerParams.reportPath} report.`);
    //   }
    // });
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
  async copyServerStaticHtml() {
    const originPath = path.join(resourcePublicServerPath, this.ServerParams.staticPath);
    const targetPath = path.join(this.context.targetDir, this.ServerParams.reportPath);
    await copy(originPath, targetPath);
  }
}

export default ServerService;
