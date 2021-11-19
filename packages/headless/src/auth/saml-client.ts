import {fetch} from 'cross-fetch';
import {getIsomorphicHistory, IsomorphicHistory} from './isomorphic-history';
import {getIsomorphicLocation, IsomorphicLocation} from './isomorphic-location';

export interface SamlOptions {
  organizationId: string;
  provider: string;
  request?: Fetch;
  location?: IsomorphicLocation;
  history?: IsomorphicHistory;
}

export interface SamlClient {
  exchangeToken(): Promise<string>;
  login(): Promise<boolean>;
}

type Fetch = (
  input: RequestInfo,
  init?: RequestInit | undefined
) => Promise<Response>;

const handshakeTokenParamName = 'handshake_token';

export function buildSamlClient(config: SamlOptions): SamlClient {
  const {request, organizationId, provider, location, history} =
    buildOptions(config);
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
      removeHandshakeTokenFromUrl(location, history);

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
    history: getIsomorphicHistory(),
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
  return isAngularHash(location) ? `#${hash.slice(2)}` : hash;
}

function isAngularHash(location: IsomorphicLocation) {
  const hash = location.hash;
  return hash.indexOf('#/') === 0;
}

function isHandshakeTokenParam(param: string) {
  const [key] = param.split('=');
  return key === handshakeTokenParamName;
}

function removeHandshakeTokenFromUrl(
  location: IsomorphicLocation,
  history: IsomorphicHistory
) {
  const delimiter = '&';
  const hash = getHashAfterAdjustingForAngular(location);
  const token = getHandshakeToken(location);
  const handshakeEntry = `${handshakeTokenParamName}=${token}`;

  const entries = hash.substr(1).split(delimiter);
  const newHash = entries
    .filter((param) => param !== handshakeEntry)
    .join(delimiter);
  const adjustedHash = isAngularHash(location) ? `/${newHash}` : newHash;

  history.replaceState(null, '', `#${adjustedHash}`);
}
