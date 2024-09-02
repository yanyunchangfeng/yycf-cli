import { init } from 'src/plugins/clearLogs';
import { logPath } from 'src/shared';
import fs from 'fs-extra';
import path from 'path';

describe('clearLogs', () => {
  const context: any = {
    logPath: path.resolve(logPath, '../unitTestClearLogs')
  };
  beforeEach(async () => {
    await fs.ensureDir(context.logPath);
  });
  it('should clear logs dir', async () => {
    await init(context);
    expect(fs.existsSync(context.logPath)).toBe(false);
  });
});
