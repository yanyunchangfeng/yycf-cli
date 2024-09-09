import { e2eTempDir } from 'test/shared';
import fs from 'fs-extra';
import { SetUpService } from 'src/services';
import path from 'path';

describe('code-analysis-tool cli e2e test', () => {
  beforeEach(async () => {
    await fs.remove(e2eTempDir);
    await fs.ensureDir(e2eTempDir);
  });
  it('should success generate project & report', async () => {
    const setUpService = new SetUpService(e2eTempDir);
    await setUpService.execGetOutput(
      'ca',
      ['create', 'github-all', '-a', '-y', '-f', '-e'],
      'create all projects & report'
    );
    const targetDir = path.join(e2eTempDir, 'github-all');
    expect(fs.existsSync(targetDir)).toBe(true);
  });
  afterEach(async () => {});
});
