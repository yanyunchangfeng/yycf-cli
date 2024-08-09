import { Repo } from '../';
export interface PluginParams {
  projectName: string;
  targetDir: string;
  destDir: string;
  repo: Repo;
  tag: string;
}

export interface PluginContext extends PluginParams {
  [key: keyof any]: any;
}
