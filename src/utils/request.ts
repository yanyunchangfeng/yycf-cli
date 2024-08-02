import axios from 'axios';
import { readConfig } from '.';

axios.interceptors.request.use(async (req) => {
  const config: any = await readConfig();
  const Authorization = config[config.default].Authorization;
  req.headers['Authorization'] = `Bearer ${Authorization}`;
  return req;
});

axios.interceptors.response.use((res) => {
  return res.data;
});

export { axios };
