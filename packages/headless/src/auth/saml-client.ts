import {fetch} from 'cross-fetch';

export interface SamlOptions {
  organizationId: string;
  provider: string;
}

export interface SamlClient {
  exchangeToken(token: string): Promise<string>;
  getRedirectUrl(): string;
}

type Fetch = (
  input: RequestInfo,
  init?: RequestInit | undefined
) => Promise<Response>;

export function buildSamlClient(
  config: SamlOptions,
  request: Fetch
): SamlClient {
  const api = 'https://platform.cloud.coveo.com/rest/search';

  return {
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

    getRedirectUrl() {
      const {organizationId, provider} = config;
      return `${api}/v2/login/${provider}?organization=${organizationId}`;
    },
  };
}

export function buildBrowserSamlClient(
  config: SamlOptions,
  location = window.location
) {
  const client = buildSamlClient(config, fetch);

  return {
    redirect() {
      const url = client.getRedirectUrl();
      location.href = url;
    },

    async exchangeHandshakeToken() {
      const url = window.location.href;
      const token = url;
      return await client.exchangeToken(token);
    },
  };
}
