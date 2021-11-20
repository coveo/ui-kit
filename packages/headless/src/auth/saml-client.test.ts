import {buildSamlClient, SamlClient, SamlClientOptions} from './saml-client';
import {SamlProvider} from './saml-provider';

describe('buildSamlClient', () => {
  let options: Required<SamlClientOptions>;
  let client: SamlClient;

  function buildMockSamlProvider(): SamlProvider {
    return {
      exchangeHandshakeToken: jest.fn().mockResolvedValue(''),
      handshakeTokenAvailable: false,
      login: jest.fn(),
    };
  }

  beforeEach(() => {
    options = {
      organizationId: '',
      provider: '',
      samlProvider: buildMockSamlProvider(),
    };

    client = buildSamlClient(options);
  });

  describe('#authenticate', () => {
    // TODO: prevent infinite loops in case search api goes down?

    it('handshake token not available, it calls #login', () => {
      const {samlProvider} = options;
      samlProvider.handshakeTokenAvailable = false;

      client.authenticate();
      expect(samlProvider.login).toHaveBeenCalledTimes(1);
    });

    it('handshake token available, it calls #exchangeHandshakeToken and returns an access token', async () => {
      const accessToken = 'access token';
      const {samlProvider} = options;
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
