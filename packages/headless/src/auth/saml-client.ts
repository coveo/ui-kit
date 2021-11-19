import {fetch} from 'cross-fetch';
import {getIsomorphicLocation, IsomorphicLocation} from './isomorphic-location';

export interface SamlOptions {
  organizationId: string;
  provider: string;
  request?: Fetch;
  location?: IsomorphicLocation;
}

export interface SamlClient {
  exchangeToken(): Promise<string>;
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

    async exchangeToken() {
      const handshakeToken = getHandshakeToken(location);
      try {
        const response = await request(`${api}/login/handshake/token`, {
          method: 'POST',
          body: JSON.stringify({handshakeToken}),
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

function getHandshakeToken(location: IsomorphicLocation): string {
  const hash = getHashAfterAdjustingForAngular(location);
  const params = hash.slice(1);
  const handshakeParam = params.split('&').find(isHandshakeTokenParam);

  return handshakeParam ? handshakeParam.split('=')[1] : '';
}

function getHashAfterAdjustingForAngular(location: IsomorphicLocation) {
  const hash = location.hash;
  const isAngular = hash.indexOf('#/') === 0;
  return isAngular ? `#${hash.slice(2)}` : hash;
}

function isHandshakeTokenParam(param: string) {
  const [key] = param.split('=');
  return key === 'handshake_token';
}
