import { init } from 'src/plugins/clearLogs';
import { logPath } from 'src/shared';
import fs from 'fs-extra';

describe('clearLogs', () => {
  const context: any = {};
  beforeEach(async () => {
    await fs.ensureDir(logPath);
  });
  it('should clear logs dir', async () => {
    await init(context);
    expect(fs.existsSync(logPath)).toBe(false);
  });
});
