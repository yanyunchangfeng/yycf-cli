import path from 'path';
import { readFile } from '../utils';

interface PluginConfig {
  name: string;
  enabled: boolean;
}

interface Config {
  plugins: PluginConfig[];
}

export async function loadConfig(): Promise<Config> {
  const configPath = path.resolve(__dirname, '../config.json');
  const data = await readFile(configPath, true);
  return data as Config;
}
