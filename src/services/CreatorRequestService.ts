import { axios, readConfig } from '../utils';
import { GITSERVER, Repo } from '../shared';

const fetchRepoList = async () => {
  const config: any = await readConfig();
  const origin = config[config.default].origin;
  const orgs = config[config.default].orgs;
  const user = config[config.default].user;
  return axios.get(`${origin}/${orgs ? 'orgs' : 'users'}/${orgs ? orgs : user}/repos`);
};

const fetchTagList = async (repo: Repo) => {
  const config: any = await readConfig();
  const origin = config[config.default].origin;
  const orgs = config[config.default].orgs;
  const user = config[config.default].user;
  return axios.get(`${origin}/repos/${orgs ?? user}/${repo.name}/tags`);
};

const fetchGitLabRepoList = async () => {
  const config: any = await readConfig();
  const origin = config[config.default].origin;
  return axios.get(`${origin}/api/v4/projects`);
};
const fetchGitLabTagList = async (repo: Repo) => {
  const config: any = await readConfig();
  const origin = config[config.default].origin;
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
