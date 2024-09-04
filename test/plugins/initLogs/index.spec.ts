import { init } from 'src/plugins/initLogs';
import { logPath, PluginContext } from 'src/shared';
import fs from 'fs-extra';
import path from 'path';

describe('initLogs', () => {
  let logDir: string;
  let context: PluginContext;
  beforeEach(async () => {
    context = {} as PluginContext;
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
