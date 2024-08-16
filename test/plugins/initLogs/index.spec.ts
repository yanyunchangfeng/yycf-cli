import { init } from 'src/plugins/initLogs';
import { logPath } from 'src/shared';
import fs from 'fs-extra';

describe('initLogs', () => {
  const context: any = {};
  beforeEach(async () => {
    if (fs.existsSync(logPath)) {
      await fs.remove(logPath);
    }
  });
  it('should init logs dir', async () => {
    await init(context);
    expect(fs.existsSync(logPath)).toBe(true);
  });
});
