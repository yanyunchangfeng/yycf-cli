import path from 'path';
import { integrationTempDir } from 'test/shared';
import { uniqueId } from '.';

export function createTempPath(prefix?: string) {
  return path.join(integrationTempDir, uniqueId(prefix));
}
