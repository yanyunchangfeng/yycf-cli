import { init } from 'src/plugins/clearLogs';
import { logPath } from 'src/shared';
import fs from 'fs-extra';
import path from 'path';

describe('clearLogs', () => {
  let logDir: string;
  const context: any = {};
  beforeEach(async () => {
    logDir = path.join(logPath, `log-${Date.now()}-${Math.random()}`);
    context.logPath = logDir;
    await fs.ensureDir(logDir);
  });
  it('should clear logs dir', async () => {
    await init(context);
    expect(fs.existsSync(logDir)).toBe(false);
  });
  afterEach(async () => {
    await fs.remove(logDir);
  });
});
