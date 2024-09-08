import path from 'path';
import { CacheRepositoryService } from 'src/services';
import { PluginContext } from 'src/shared';

const cache = new CacheRepositoryService({ cacheDirName: 'testTemp' } as PluginContext);

export const tempDir = cache.cacheDir;
// export const tempDir = path.join(process.cwd(), '../testTemp');

export const resourcePublicServerPath = path.join(process.cwd(), 'bin', 'resources', 'public', 'server');

export const gitServerPath = path.join(process.cwd(), 'bin', 'resources', 'db', 'gitServerJson', 'index.json');
