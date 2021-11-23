import {fetch} from 'cross-fetch';
import {getIsomorphicHistory, IsomorphicHistory} from './isomorphic-history';
import {getIsomorphicLocation, IsomorphicLocation} from './isomorphic-location';

export interface SamlFlowOptions {
  organizationId: string;
  provider: string;
  request?: Fetch;
  location?: IsomorphicLocation;
  history?: IsomorphicHistory;
}

export interface SamlFlow {
  exchangeHandshakeToken(): Promise<string>;
  handshakeTokenAvailable: boolean;
  login(): void;
}

type Fetch = (
  input: RequestInfo,
  init?: RequestInit | undefined
) => Promise<Response>;

const handshakeTokenParamName = 'handshake_token';

export function buildSamlFlow(config: SamlFlowOptions): SamlFlow {
  const options = buildOptions(config);
  const api = 'https://platform.cloud.coveo.com/rest/search';

  return {
    login() {
      const {organizationId, provider, location} = options;
      const redirectUri = encodeURIComponent(location.href);
      const params = `organizationId=${organizationId}&redirectUri=${redirectUri}`;

      location.href = `${api}/v2/login/${provider}?${params}`;
    },

    async exchangeHandshakeToken() {
      const {location, history, request} = options;
      const handshakeToken = getHandshakeToken(location);
      removeHandshakeToken(location, history);

      try {
        const response = await request(`${api}/login/handshake/token`, {
          method: 'POST',
          body: JSON.stringify({handshakeToken}),
          headers: {
            'content-type': 'application/json; charset=UTF-8',
          },
        });
        const data = await response.json();
        return data.token;
      } catch (e) {
        return '';
      }
    },

    get handshakeTokenAvailable() {
      return !!getHandshakeToken(options.location);
    },
  };
}

function buildOptions(config: SamlFlowOptions): Required<SamlFlowOptions> {
  return {
    location: getIsomorphicLocation(),
    history: getIsomorphicHistory(),
    request: fetch,
    ...config,
  };
}

function getHandshakeToken(location: IsomorphicLocation): string {
  const params = getHashParamsAfterAdjustingForAngular(location);
  const handshakeParam = params.get(handshakeTokenParamName);

  return handshakeParam || '';
}

function getHashParamsAfterAdjustingForAngular(location: IsomorphicLocation) {
  const hash = location.hash;
  const adjustedHash = isAngularHash(location) ? hash.slice(2) : hash.slice(1);
  return new URLSearchParams(adjustedHash);
}

function isAngularHash(location: IsomorphicLocation) {
  const hash = location.hash;
  return hash.indexOf('#/') === 0;
}

function removeHandshakeToken(
  location: IsomorphicLocation,
  history: IsomorphicHistory
) {
  const params = getHashParamsAfterAdjustingForAngular(location);
  params.delete(handshakeTokenParamName);
  const newHash = params.toString();

  const adjustedHash = isAngularHash(location) ? `/${newHash}` : newHash;

  history.replaceState(null, '', `#${adjustedHash}`);
}
