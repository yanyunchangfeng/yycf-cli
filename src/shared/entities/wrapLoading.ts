export type WrapLoadingFn = <T extends (...args: any[]) => any>(
  fn: T | any,
  message: string,
  ...args: any[]
) => Promise<any>;
