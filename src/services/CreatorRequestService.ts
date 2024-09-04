import { dbService } from '../services';
import { axios } from '../utils';
import { GITSERVER, Repo } from '../shared';

const fetchRepoList = async () => {
  const { origin, orgs, user } = await dbService.readGitServerConfig();
  return axios.get(`${origin}/${orgs ? 'orgs' : 'users'}/${orgs ? orgs : user}/repos`);
};

const fetchTagList = async (repo: Repo) => {
  const { origin, orgs, user } = await dbService.readGitServerConfig();
  return axios.get(`${origin}/repos/${orgs ? orgs : user}/${repo.name}/tags`);
};

const fetchGitLabRepoList = async () => {
  const { origin } = await dbService.readGitServerConfig();
  return axios.get(`${origin}/api/v4/projects`);
};
const fetchGitLabTagList = async (repo: Repo) => {
  const { origin } = await dbService.readGitServerConfig();
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
