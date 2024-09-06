import { init } from 'src/plugins/installDependencies';
import { PluginContext } from 'src/shared';
import { InstallDependencies } from 'src/services';

describe('installDependencies', () => {
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
    initSpy = jest.spyOn(InstallDependencies.prototype, 'init').mockImplementation((() => {}) as any);
    jest.clearAllMocks();
  });

  it('should install dependencies', async () => {
    await init(context);
    expect(initSpy).toHaveBeenCalled();
  });

  afterEach(async () => {});
});
