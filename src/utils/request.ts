import axios from 'axios';
import { readConfig } from '.';

axios.interceptors.request.use(async (req) => {
  const config: any = await readConfig();
  axios.defaults.headers.common['Authorization'] = `Bearer ${config.Authorization}`;
  return req;
});

axios.interceptors.response.use((res) => {
  return res.data;
});

export { axios };
