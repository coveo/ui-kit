import {buildSamlClient, SamlClient, SamlClientOptions} from './saml-client';
import * as SamlProvider from './saml-provider';

describe('buildSamlClient', () => {
  let options: Required<SamlClientOptions>;
  let client: SamlClient;
  let samlProvider: SamlProvider.SamlProvider;

  function buildMockSamlProvider(): SamlProvider.SamlProvider {
    return {
      exchangeHandshakeToken: jest.fn().mockResolvedValue(''),
      handshakeTokenAvailable: false,
      login: jest.fn(),
    };
  }

  beforeEach(() => {
    samlProvider = buildMockSamlProvider();
    jest.spyOn(SamlProvider, 'buildSamlProvider').mockReturnValue(samlProvider);

    options = {
      organizationId: '',
      provider: '',
    };

    client = buildSamlClient(options);
  });

  describe('#authenticate', () => {
    // TODO: prevent infinite loops in case search api goes down?

    it('handshake token not available, it calls #login', () => {
      samlProvider.handshakeTokenAvailable = false;

      client.authenticate();
      expect(samlProvider.login).toHaveBeenCalledTimes(1);
    });

    it('handshake token available, it calls #exchangeHandshakeToken and returns an access token', async () => {
      const accessToken = 'access token';
      samlProvider.handshakeTokenAvailable = true;
      samlProvider.exchangeHandshakeToken = jest
        .fn()
        .mockResolvedValue(accessToken);

      const res = await client.authenticate();

      expect(samlProvider.exchangeHandshakeToken).toHaveBeenCalledTimes(1);
      expect(res).toBe(accessToken);
    });
  });
});
