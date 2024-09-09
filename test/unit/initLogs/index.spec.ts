import { init } from 'src/plugins/initLogs';
import { PluginContext } from 'src/shared';
import fs from 'fs-extra';
import { createTempPath } from 'test/utils';

describe('initLogs', () => {
  let logDir: string;
  let context: PluginContext;

  beforeEach(async () => {
    context = {} as PluginContext;
    logDir = createTempPath('logs');
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
