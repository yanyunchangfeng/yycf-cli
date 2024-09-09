import { init } from 'src/plugins/clearLogs';
import { PluginContext } from 'src/shared';
import fs from 'fs-extra';
import { createTempPath } from 'test/utils';

describe('clearLogs', () => {
  let logDir: string;
  let context: PluginContext;
  let initSpy: jest.SpyInstance;

  beforeEach(async () => {
    context = {} as PluginContext;
    initSpy = jest.spyOn(fs, 'remove').mockImplementation((() => {}) as any);
    logDir = createTempPath();
    context.logPath = logDir;
  });

  it('should clear logs dir', async () => {
    await init(context);
    expect(initSpy).toHaveBeenCalledWith(context.logPath);
  });

  afterEach(async () => {});
});
