import { init } from 'src/plugins/initGit';
import { PluginContext } from 'src/shared';
import { SetUpService } from 'src/services';
import { uniqueId } from 'test/utils';

describe('initGit', () => {
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
    initSpy = jest.spyOn(SetUpService.prototype, 'exec').mockImplementation((() => {}) as any);
    jest.clearAllMocks();
  });

  it('should init git repository', async () => {
    await init(context);
    expect(initSpy).toHaveBeenCalledWith('git', ['init'], `initialize ${repoName} git repository`);
  });

  afterEach(async () => {});
});
