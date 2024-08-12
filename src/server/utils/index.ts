import http from 'http';

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
