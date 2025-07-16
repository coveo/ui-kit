// biome-ignore lint/suspicious/noExplicitAny: <>
export type Constructor<T = {}> = new (...args: any[]) => T;
