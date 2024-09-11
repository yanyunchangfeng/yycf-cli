import path from 'path';
import { CacheRepositoryService } from 'src/services';
import { PluginContext } from 'src/shared';

const integrationCache = new CacheRepositoryService({ cacheDirName: 'integrationTestTemp' } as PluginContext);

// export const integrationTempDir = integrationCache.cacheDir;
export const integrationTempDir = path.join(process.cwd(), 'integrationTestTemp');

const e2eCache = new CacheRepositoryService({ cacheDirName: 'e2eTestTemp' } as PluginContext);

// export const e2eTempDir = e2eCache.cacheDir;
export const e2eTempDir = path.join(process.cwd(), 'e2eTestTemp');

export const resourcePublicServerPath = path.join(process.cwd(), 'bin', 'resources', 'public', 'server');

export const gitServerPath = path.join(process.cwd(), 'bin', 'resources', 'db', 'gitServerJson', 'index.json');

export const cliRootPath = path.join(process.cwd(), 'src', 'index.ts');
