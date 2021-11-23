import {buildSamlFlow} from './saml-flow';

export interface SamlClientOptions {
  organizationId: string;
  provider: string;
  platformOrigin?: string;
}

export interface SamlClient {
  authenticate(): Promise<string>;
}

export function buildSamlClient(config: SamlClientOptions): SamlClient {
  const provider = buildSamlFlow(config);

  return {
    async authenticate() {
      if (provider.handshakeTokenAvailable) {
        return await provider.exchangeHandshakeToken();
      }

      provider.login();
      return '';
    },
  };
}
