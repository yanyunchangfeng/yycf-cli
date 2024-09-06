import { init } from 'src/plugins/madgeReport';
import { PluginContext } from 'src/shared';
import { MadgeReportService } from 'src/services';
import { uniqueId } from 'test/utils';

describe('madgeReport', () => {
  let context: PluginContext;
  let initSpy: jest.SpyInstance;
  let repoName: string;

  beforeEach(async () => {
    context = {} as PluginContext;
    repoName = uniqueId();
    context.repos = [
      {
        id: Date.now(),
        name: repoName,
        tag: 'v1.0.0'
      }
    ];
    initSpy = jest.spyOn(MadgeReportService.prototype, 'init').mockImplementation((() => {}) as any);
    jest.clearAllMocks();
  });

  it('should init madge report', async () => {
    await init(context);
    expect(initSpy).toHaveBeenCalled();
  });

  afterEach(async () => {});
});
