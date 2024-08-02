import { axios, readConfig } from '../utils';
import { GITSERVER, Repo } from '../shared';

const fetchRepoList = async () => {
  const config: any = await readConfig();
  const origin = config[config.default].apiUrl;
  const orgName = config[config.default].orgName;
  return axios.get(`${origin}/orgs/${orgName}/repos`);
};

const fetchTagList = async (repo: Repo) => {
  const config: any = await readConfig();
  const origin = config[config.default].apiUrl;
  const orgName = config[config.default].orgName;
  return axios.get(`${origin}/repos/${orgName}/${repo.name}/tags`);
};

const fetchGitLabRepoList = async () => {
  const config: any = await readConfig();
  const origin = config[config.default].apiUrl;
  return axios.get(`${origin}/api/v4/projects`);
};
const fetchGitLabTagList = async (repo: Repo) => {
  const config: any = await readConfig();
  const origin = config[config.default].apiUrl;
  return axios.get(`${origin}/api/v4/projects/${repo.id}/repository/tags`);
};
export default {
  [GITSERVER.GITHUB]: {
    fetchTagList,
    fetchRepoList
  },
  [GITSERVER.GITLAB]: {
    fetchTagList: fetchGitLabTagList,
    fetchRepoList: fetchGitLabRepoList
  }
};
