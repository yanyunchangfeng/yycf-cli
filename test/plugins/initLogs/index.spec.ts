import { init } from 'src/plugins/initLogs';
import { logPath } from 'src/shared';
import fs from 'fs-extra';
import path from 'path';

describe('initLogs', () => {
  const context: any = {
    logPath: path.resolve(logPath, '../unitTestInitLogs')
  };
  beforeEach(async () => {
    if (fs.existsSync(context.logPath)) {
      await fs.remove(context.logPath);
    }
  });
  it('should init logs dir', async () => {
    await init(context);
    expect(fs.existsSync(context.logPath)).toBe(true);
  });
  afterEach(async () => {
    if (fs.existsSync(context.logPath)) {
      await fs.remove(context.logPath);
    }
  });
});
