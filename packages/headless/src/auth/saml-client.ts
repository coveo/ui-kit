import {buildSamlProvider} from './saml-provider';

export interface SamlClientOptions {
  organizationId: string;
  provider: string;
}

export interface SamlClient {
  authenticate(): Promise<string>;
}

export function buildSamlClient(config: SamlClientOptions): SamlClient {
  const provider = buildSamlProvider(config);

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
