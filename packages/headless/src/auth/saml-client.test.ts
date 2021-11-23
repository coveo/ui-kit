import {buildSamlClient, SamlClient, SamlClientOptions} from './saml-client';
import * as SamlFlow from './saml-flow';

describe('buildSamlClient', () => {
  let options: Required<SamlClientOptions>;
  let client: SamlClient;
  let samlFlow: SamlFlow.SamlFlow;

  function buildMockSamlFlow(): SamlFlow.SamlFlow {
    return {
      exchangeHandshakeToken: jest.fn().mockResolvedValue(''),
      handshakeTokenAvailable: false,
      login: jest.fn(),
    };
  }

  beforeEach(() => {
    samlFlow = buildMockSamlFlow();
    jest.spyOn(SamlFlow, 'buildSamlFlow').mockReturnValue(samlFlow);

    options = {
      organizationId: '',
      provider: '',
    };

    client = buildSamlClient(options);
  });

  describe('#authenticate', () => {
    // TODO: prevent infinite loops in case search api goes down?

    it('handshake token not available, it calls #login', () => {
      samlFlow.handshakeTokenAvailable = false;

      client.authenticate();
      expect(samlFlow.login).toHaveBeenCalledTimes(1);
    });

    it('handshake token available, it calls #exchangeHandshakeToken and returns an access token', async () => {
      const accessToken = 'access token';
      samlFlow.handshakeTokenAvailable = true;
      samlFlow.exchangeHandshakeToken = jest
        .fn()
        .mockResolvedValue(accessToken);

      const res = await client.authenticate();

      expect(samlFlow.exchangeHandshakeToken).toHaveBeenCalledTimes(1);
      expect(res).toBe(accessToken);
    });
  });
});
