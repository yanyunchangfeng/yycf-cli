import { init } from 'src/plugins/initLogs';
import { logPath } from 'src/shared';
import fs from 'fs-extra';
import path from 'path';

describe('initLogs', () => {
  let logDir: string;
  const context: any = {};
  beforeEach(async () => {
    logDir = path.join(logPath, `log-${Date.now()}-${Math.random()}`);
    context.logPath = logDir;
    await fs.remove(logDir);
  });
  it('should init logs dir', async () => {
    await init(context);
    expect(fs.existsSync(logDir)).toBe(true);
  });
  afterEach(async () => {
    await fs.remove(logDir);
  });
});
