import { Repo } from '.';

export interface PluginParams {
  projectName: string;
  targetDir: string;
  destDirs: string[];
  repos: Repo[];
  skipPrompts?: boolean;
  cacheDirName?: string;
  all?: boolean;
  logPath?: string;
  git?: boolean;
  runInstall?: boolean;
}

export interface PluginContext extends PluginParams {
  [key: keyof any]: any;
}
