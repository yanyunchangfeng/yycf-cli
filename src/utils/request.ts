import axios from 'axios';
import { readGitServerConfig } from '.';

axios.interceptors.request.use(async (req) => {
  const { Authorization } = await readGitServerConfig();
  req.headers['Authorization'] = `Bearer ${Authorization}`;
  return req;
});

axios.interceptors.response.use((res) => {
  return res.data;
});

export { axios };
