import ora from 'ora';
import { sleep } from '.';
import { WrapLoadingFn } from '../shared';

export const wrapLoading: WrapLoadingFn = async (fn, message, ...args) => {
  const spinner = ora(message);
  spinner.start();
  try {
    let repos = await fn(...args);
    spinner.succeed();
    return repos;
  } catch (err) {
    spinner.fail(`request failed, refetch ... ${err}`);
    await sleep(1000);
    return wrapLoading(fn, message, ...args);
  }
};
