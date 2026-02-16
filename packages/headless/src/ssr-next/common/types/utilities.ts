export type HasKey<T, K extends PropertyKey> = T extends unknown
  ? K extends keyof T
    ? T[K] extends never
      ? never
      : true
    : never
  : never;

export type HasKeys<TObject> = TObject extends {}
  ? keyof TObject extends never
    ? false
    : true
  : boolean;

export type HasRequiredKeys<TObject> = TObject extends {}
  ? {
      [K in keyof TObject]-?: {} extends Pick<TObject, K> ? never : K;
    }[keyof TObject] extends never
    ? false
    : true
  : boolean;
