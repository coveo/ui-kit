import {type BrowserFetch, getBrowserFetch} from './browser-fetch';
import {type BrowserHistory, getBrowserHistory} from './browser-history';
import {type BrowserLocation, getBrowserLocation} from './browser-location';

export interface SamlFlowOptions {
  organizationId: string;
  provider: string;
  platformOrigin?: string;
  request?: BrowserFetch;
  location?: BrowserLocation;
  history?: BrowserHistory;
}

export interface SamlFlow {
  exchangeHandshakeToken(): Promise<string>;
  handshakeTokenAvailable: boolean;
  login(): void;
}

const handshakeTokenParamName = 'handshake_token';

export function buildSamlFlow(config: SamlFlowOptions): SamlFlow {
  const options = buildOptions(config);
  const api = `${options.platformOrigin}/rest/search/v2/login`;

  return {
    login() {
      const {organizationId, provider, location} = options;
      const redirectUri = encodeURIComponent(location.href);
      const params = `organizationId=${organizationId}&redirectUri=${redirectUri}`;

      location.href = `${api}/${provider}?${params}`;
    },

    async exchangeHandshakeToken() {
      const {organizationId, location, history, request} = options;
      const encodedOrgId = encodeURIComponent(organizationId);
      const handshakeToken = getHandshakeToken(location);
      removeHandshakeToken(location, history);

      try {
        const response = await request(
          `${api}/handshake/token?organizationId=${encodedOrgId}`,
          {
            method: 'POST',
            body: JSON.stringify({handshakeToken}),
            headers: {
              'content-type': 'application/json; charset=UTF-8',
            },
          }
        );
        const data = await response.json();
        return data.token;
      } catch (_) {
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
    location: getBrowserLocation(),
    history: getBrowserHistory(),
    request: getBrowserFetch(),
    platformOrigin: 'https://platform.cloud.coveo.com',
    ...config,
  };
}

function getHandshakeToken(location: BrowserLocation): string {
  const params = getHashParamsAfterAdjustingForAngular(location);
  const handshakeParam = params.get(handshakeTokenParamName);

  return handshakeParam || '';
}

function getHashParamsAfterAdjustingForAngular(location: BrowserLocation) {
  const hash = location.hash;
  const adjustedHash = isAngularHash(location) ? hash.slice(2) : hash.slice(1);
  return new URLSearchParams(adjustedHash);
}

function isAngularHash(location: BrowserLocation) {
  const hash = location.hash;
  return hash.indexOf('#/') === 0;
}

function removeHandshakeToken(
  location: BrowserLocation,
  history: BrowserHistory
) {
  const params = getHashParamsAfterAdjustingForAngular(location);
  params.delete(handshakeTokenParamName);
  const newHash = params.toString();

  const adjustedHash = isAngularHash(location) ? `/${newHash}` : newHash;

  history.replaceState(null, '', `#${adjustedHash}`);
}
