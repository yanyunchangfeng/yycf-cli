import axios from 'axios';
import { dbService } from '../services';

axios.interceptors.request.use(async (req) => {
  const { Authorization } = await dbService.readGitServerConfig();
  req.headers['Authorization'] = `Bearer ${Authorization}`;
  return req;
});

axios.interceptors.response.use((res) => {
  return res.data;
});

export { axios };
