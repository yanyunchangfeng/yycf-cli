import express from 'express';
import path from 'path';
import http from 'http';
import { logger, readFile } from '../utils';
import open from 'open';

const app = express();
const basePort = 3000;
let server: http.Server;

app.use(express.static(path.join(__dirname, '../resources/public/server')));

export async function findAvailablePort(port: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const testServer = http.createServer();
    testServer.listen(port);
    testServer.on('listening', () => {
      testServer.close();
      resolve(port);
    });
    testServer.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        resolve(findAvailablePort(port + 1));
      } else {
        reject(err);
      }
    });
  });
}

export async function startServer(projectDir: string) {
  // 路由读取 JSON 文件并发送到前端
  app.get('/eslint-report', async (req, res) => {
    const reportPath = path.join(projectDir, 'eslint-report.json');
    try {
      const data = await readFile(reportPath, true);
      res.json(data);
    } catch (err) {
      res.status(500).send('Error reading ESLint report.');
    }
  });
  try {
    const port = await findAvailablePort(basePort);
    server = app.listen(port, () => {
      logger.info(`Server running at http://localhost:${port}`);
      open(`http://localhost:${port}`);
    });
  } catch (err) {
    logger.error(`Error finding available port: ${err}`);
  }
}

export function stopServer() {
  if (server) {
    server.close(() => {
      logger.info('Server stopped.');
    });
  }
}
