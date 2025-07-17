export class URLPath {
  private _basePath: string;
  private _params: Record<string, string> = {};

  constructor(basePath: string) {
    this._basePath = basePath;
  }

  public addParam(name: string, value: string) {
    this._params = {
      ...this.params,
      [name]: value,
    };
  }

  get basePath() {
    return this._basePath;
  }

  get params() {
    return this._params;
  }

  get hasParams() {
    return Object.entries(this._params).length;
  }

  get href() {
    return this.hasParams
      ? `${this.basePath}?${Object.entries(this.params)
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join('&')}`
      : this.basePath;
  }
}

type PlatformCombination =
  | {env: 'dev'; region: 'us' | 'eu'}
  | {env: 'stg'; region: 'us'}
  | {env: 'hipaa'; region: 'us'}
  | {env: 'prod'; region: 'us' | 'eu' | 'au'};

export type PlatformEnvironment = PlatformCombination['env'];
