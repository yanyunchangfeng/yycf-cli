import { init } from 'src/plugins/clearLogs';
import fs from 'fs-extra';
jest.mock('fs-extra');

describe('clearLogs', () => {
  const context: any = {};
  it('should clear logs', () => {
    // init(context);
  });
});
