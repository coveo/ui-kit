import {fetch} from 'cross-fetch';
import {getIsomorphicLocation, IsomorphicLocation} from './isomorphic-location';

export interface SamlOptions {
  organizationId: string;
  provider: string;
  request?: Fetch;
  location?: IsomorphicLocation;
}

export interface SamlClient {
  exchangeToken(token: string): Promise<string>;
  login(): Promise<boolean>;
}

type Fetch = (
  input: RequestInfo,
  init?: RequestInit | undefined
) => Promise<Response>;

export function buildSamlClient(config: SamlOptions): SamlClient {
  const {request, organizationId, provider, location} = buildOptions(config);
  const api = 'https://platform.cloud.coveo.com/rest/search';

  return {
    async login() {
      const redirectUri = encodeURIComponent(location.href);
      const params = `organizationId=${organizationId}&redirectUri=${redirectUri}`;

      try {
        await request(`${api}/v2/login/${provider}?${params}`);
        return true;
      } catch (e) {
        return false;
      }
    },

    async exchangeToken(token) {
      try {
        const response = await request(`${api}/login/handshake/token`, {
          method: 'POST',
          body: JSON.stringify({token}),
        });
        const data = await response.json();
        return data.token;
      } catch (e) {
        return '';
      }
    },
  };
}

function buildOptions(config: SamlOptions): Required<SamlOptions> {
  return {
    location: getIsomorphicLocation(),
    request: fetch,
    ...config,
  };
}
