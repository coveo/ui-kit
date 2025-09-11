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

export type HasOptionalKeys<TObject> = TObject extends {}
  ? {
      [K in keyof TObject]-?: {} extends Pick<TObject, K> ? K : never;
    }[keyof TObject] extends never
    ? false
    : true
  : boolean;

type ExtractRequiredOptions<TOptions> = {
  [TKey in keyof TOptions as Pick<TOptions, TKey> extends Required<
    Pick<TOptions, TKey>
  >
    ? TKey
    : never]: TOptions[TKey];
};

/**
 * @deprecated This type will be removed in the next major version.
 */
export type OptionsTuple<TOptions> = HasKeys<TOptions> extends false
  ? []
  : HasKeys<ExtractRequiredOptions<TOptions>> extends false
    ? [options?: TOptions]
    : [options: TOptions];

export type OptionsExtender<TOptions> = (
  options: TOptions
) => TOptions | Promise<TOptions>;
