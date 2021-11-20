import {buildSamlProvider, SamlProvider} from './saml-provider';

export interface SamlClientOptions {
  organizationId: string;
  provider: string;
  samlProvider?: SamlProvider;
}

export interface SamlClient {
  authenticate(): Promise<string>;
}

export function buildSamlClient(config: SamlClientOptions): SamlClient {
  const provider = config.samlProvider || buildSamlProvider(config);

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
