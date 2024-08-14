import express from 'express';
import path from 'path';
import http from 'http';
import { logger, readFile } from '../../utils';
import open from 'open';
import { findAvailablePort } from '../utils';
import { resourcePath } from '../../shared';
const app = express();
const basePort = 3000;
let server: http.Server;

app.use(express.static(path.join(resourcePath, 'public/server/plato')));

export async function startPlatoServer(projectDir: string) {
  // 路由读取 JSON 文件并发送到前端
  app.get('/report', async (req, res) => {
    const reportPath = path.join(projectDir, 'plato-report/report.json');
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
      logger.info(`Plato Server running at http://localhost:${port}`);
      open(`http://localhost:${port}`);
    });
  } catch (err) {
    logger.error(`Error finding available port: ${err}`);
  }
}

export function stopPlatoServer() {
  if (server) {
    server.close(() => {
      logger.info('Server stopped.');
    });
  }
}
