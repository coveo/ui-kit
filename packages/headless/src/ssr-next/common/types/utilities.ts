export type HasKey<T, K extends PropertyKey> = T extends unknown
  ? K extends keyof T
    ? T[K] extends never
      ? never
      : true
    : never
  : never;
