import { e2eTempDir } from 'test/shared';
import fs from 'fs-extra';
import { SetUpService } from 'src/services';
import { uniqueId } from 'test/utils';
import path from 'path';

describe('code-analysis-tool cli e2e test', () => {
  let projectName: string;
  beforeEach(async () => {
    await fs.remove(e2eTempDir);
    await fs.ensureDir(e2eTempDir);
    projectName = uniqueId('projects');
  });
  it('should success generate project & report', async () => {
    const setUpService = new SetUpService(e2eTempDir);
    await setUpService.execGetOutput(
      'cf',
      ['create', projectName, '-a', '-y', '-f', '-e'],
      'create all projects & report'
    );
    const targetDir = path.join(e2eTempDir, projectName);
    expect(fs.existsSync(targetDir)).toBe(true);
  });
  afterEach(async () => {});
});
