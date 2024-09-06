import { init } from 'src/plugins/innerEslintReport';
import { PluginContext } from 'src/shared';
import { EslintReportService } from 'src/services';

describe('innerEslintReport', () => {
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
    initSpy = jest.spyOn(EslintReportService.prototype, 'initInnerEslint').mockImplementation((() => {}) as any);
    jest.clearAllMocks();
  });

  it('should init eslint report', async () => {
    await init(context);
    expect(initSpy).toHaveBeenCalled();
  });

  afterEach(async () => {});
});
