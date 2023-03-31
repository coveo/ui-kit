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

export type PlatformCombination =
  | {env: 'dev'; region: 'us' | 'eu'}
  | {env: 'stg'; region: 'us'}
  | {env: 'hipaa'; region: 'us'}
  | {env: 'prod'; region: 'us' | 'eu' | 'au'};

export type PlatformEnvironment = PlatformCombination['env'];

export const isCoveoPlatformURL = (url: string) =>
  /^https:\/\/platform(dev|stg|hipaa)?(-)?(eu|au)?\.cloud\.coveo\.com/.test(
    url
  );

export const matchCoveoOrganizationEndpointUrl = (
  url: string,
  organizationId: string
) => {
  const match = url.match(
    new RegExp(`^https://${organizationId}\\.org(dev|stg|hipaa)?\\.coveo.com`)
  );
  console.log(match);
  return match;
};
