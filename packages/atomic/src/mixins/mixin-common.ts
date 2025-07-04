// biome-ignore lint/suspicious/noExplicitAny: Acceptable for mixin constructor
export type Constructor<T = {}> = new (...args: any[]) => T;
