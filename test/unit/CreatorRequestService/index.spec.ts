import { dbService, CreatoRequestService } from 'src/services';
import { axios } from 'src/utils';
import { GITSERVER, Repo } from 'src/shared';

describe('Git Service API Calls', () => {
  let mockDbService: jest.SpyInstance;
  let axiosGetSpy: jest.SpyInstance;
  beforeEach(() => {
    // mock dbService
    mockDbService = jest.spyOn(dbService, 'readGitServerConfig');
    axiosGetSpy = jest.spyOn(axios, 'get');
    jest.clearAllMocks(); // 清理 mock
  });

  afterEach(() => {});

  it('should fetch GitHub repo list', async () => {
    // 模拟 dbService 返回的数据
    mockDbService.mockResolvedValue({
      origin: 'https://api.github.com',
      orgs: 'my-org',
      user: 'my-user'
    });

    // 模拟 axios 返回的数据
    axiosGetSpy.mockResolvedValue([{ name: 'repo1' }, { name: 'repo2' }]);

    // 调用 fetchRepoList
    const repoList = await CreatoRequestService[GITSERVER.GITHUB].fetchRepoList();

    // 验证调用 axios 的参数
    expect(axiosGetSpy).toHaveBeenCalledWith('https://api.github.com/orgs/my-org/repos', {
      params: { page: 1, per_page: 100 }
    });
    // 验证调用的结果
    expect(repoList).toEqual([{ name: 'repo1' }, { name: 'repo2' }]);
  });

  it('should fetch GitHub tags for a repo', async () => {
    mockDbService.mockResolvedValue({
      origin: 'https://api.github.com',
      orgs: 'my-org',
      user: 'my-user'
    });

    // 模拟 axios 返回的数据
    const repo: Repo = { name: 'repo1', id: 1, tag: 'v1.0.0' };
    axiosGetSpy.mockResolvedValue([{ name: 'v1.0.0' }, { name: 'v1.1.0' }]);

    // 调用 fetchTagList
    const tagList = await CreatoRequestService[GITSERVER.GITHUB].fetchTagList(repo);

    // 验证调用 axios 的参数
    expect(axiosGetSpy).toHaveBeenCalledWith('https://api.github.com/repos/my-org/repo1/tags');
    // 验证调用的结果
    expect(tagList).toEqual([{ name: 'v1.0.0' }, { name: 'v1.1.0' }]);
  });

  it('should fetch GitLab repo list', async () => {
    mockDbService.mockResolvedValue({
      origin: 'https://gitlab.com'
    });

    // 模拟 axios 返回的数据
    axiosGetSpy.mockResolvedValue([
      { name: 'repo1', id: 1 },
      { name: 'repo2', id: 2 }
    ]);

    // 调用 fetchGitLabRepoList
    const repoList = await CreatoRequestService[GITSERVER.GITLAB].fetchRepoList();

    // 验证调用 axios 的参数
    expect(axiosGetSpy).toHaveBeenCalledWith('https://gitlab.com/api/v4/projects', {
      params: { per_page: 100, page: 1 }
    });
    // 验证调用的结果
    expect(repoList).toEqual([
      { name: 'repo1', id: 1 },
      { name: 'repo2', id: 2 }
    ]);
  });

  it('should fetch GitLab tags for a repo', async () => {
    mockDbService.mockResolvedValue({
      origin: 'https://gitlab.com'
    });

    // 模拟 axios 返回的数据
    const repo: Repo = { id: 1, name: 'repo1', tag: 'v1.0.0' };
    axiosGetSpy.mockResolvedValue({ data: [{ name: 'v1.0.0' }, { name: 'v1.1.0' }] });

    // 调用 fetchGitLabTagList
    const tagList = await CreatoRequestService[GITSERVER.GITLAB].fetchTagList(repo);

    // 验证调用 axios 的参数
    expect(axiosGetSpy).toHaveBeenCalledWith('https://gitlab.com/api/v4/projects/1/repository/tags');
    // 验证调用的结果
    expect(tagList.data).toEqual([{ name: 'v1.0.0' }, { name: 'v1.1.0' }]);
  });
});
