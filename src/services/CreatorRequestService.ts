import { axios, readConfig } from '../utils';

const fetchRepoList = async () => {
  const config: any = await readConfig();
  return axios.get(`${config.apiUrl}/orgs/${config.orgName}/repos`);
};

const fetchTagList = async (repo: string) => {
  const config: any = await readConfig();
  return axios.get(`${config.apiUrl}/repos/${config.orgName}/${repo}/tags`);
};

export default {
  fetchRepoList,
  fetchTagList
};
