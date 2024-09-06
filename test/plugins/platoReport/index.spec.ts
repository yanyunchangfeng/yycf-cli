import { init } from 'src/plugins/platoReport';
import { PluginContext } from 'src/shared';
import { PlatoReportService } from 'src/services';

describe('platopReport', () => {
  let context: PluginContext;
  let initSpy: jest.SpyInstance;
  let repoName: string;

  beforeEach(async () => {
    context = {} as PluginContext;
    repoName = `repo-${Date.now()}-${Math.random()}`;
    context.repos = [
      {
        id: Date.now(),
        name: repoName,
        tag: 'v1.0.0'
      }
    ];
    initSpy = jest.spyOn(PlatoReportService.prototype, 'init').mockImplementation((() => {}) as any);
    jest.clearAllMocks();
  });

  it('should init madge report', async () => {
    await init(context);
    expect(initSpy).toHaveBeenCalled();
  });

  afterEach(async () => {});
});
