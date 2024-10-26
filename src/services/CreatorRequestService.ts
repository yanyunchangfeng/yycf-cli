import { dbService } from '../services';
import { axios } from '../utils';
import { GITSERVER, Repo } from '../shared';

const buildRepoUrl = (origin: string, orgs: string, user: string) =>
  `${origin}/${orgs ? 'orgs' : 'users'}/${orgs || user}/repos`;

const fetchAllData = async (url: string, params: Record<keyof any, any> = {}) => {
  const allData = [];
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    const data = await axios.get<typeof params, Record<keyof any, any>[]>(url, { params: { ...params, page } });
    allData.push(...data);
    hasMore = data.length === params.per_page;
    page++;
  }
  return allData;
};

const fetchGithubRepoList = async (params = { per_page: 100 }) => {
  const { origin, orgs, user } = await dbService.readGitServerConfig();
  const url = buildRepoUrl(origin, orgs, user);
  return await fetchAllData(url, params);
};

const fetchGithubTagList = async (repo: Repo) => {
  const { origin, orgs, user } = await dbService.readGitServerConfig();
  return axios.get(`${origin}/repos/${orgs ? orgs : user}/${repo.name}/tags`);
};

const fetchGitLabRepoList = async (params = { per_page: 100 }) => {
  const { origin } = await dbService.readGitServerConfig();
  const url = `${origin}/api/v4/projects`;
  return await fetchAllData(url, params);
};

const fetchGitLabTagList = async (repo: Repo) => {
  const { origin } = await dbService.readGitServerConfig();
  return axios.get(`${origin}/api/v4/projects/${repo.id}/repository/tags`);
};

export default {
  [GITSERVER.GITHUB]: {
    fetchTagList: fetchGithubTagList,
    fetchRepoList: fetchGithubRepoList
  },
  [GITSERVER.GITLAB]: {
    fetchTagList: fetchGitLabTagList,
    fetchRepoList: fetchGitLabRepoList
  }
};
