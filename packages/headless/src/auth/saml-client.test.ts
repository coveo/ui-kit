import {buildSamlClient, SamlClient, SamlOptions} from './saml-client';

describe('buildSamlClient', () => {
  let options: SamlOptions;
  let request: jest.Mock<any, any>;
  let client: SamlClient;

  function initSamlClient() {
    client = buildSamlClient(options, request);
  }

  beforeEach(() => {
    options = {
      organizationId: '',
      provider: '',
    };

    request = jest.fn();

    initSamlClient();
  });

  it('#getRedirectUrl returns the expected url', () => {
    options = {
      organizationId: 'org',
      provider: 'okta',
    };

    initSamlClient();

    const url = client.getRedirectUrl();
    expect(url).toBe(
      'https://platform.cloud.coveo.com/rest/search/v2/login/okta?organization=org'
    );
  });

  describe('#exchangeToken', () => {
    it('sends a request with the token', () => {
      const token = 'handshakeToken';
      client.exchangeToken(token);

      expect(request).toHaveBeenCalledWith(
        'https://platform.cloud.coveo.com/rest/search/login/handshake/token',
        {
          method: 'POST',
          body: JSON.stringify({token}),
        }
      );
    });

    it('returns the accesstoken in the response', async () => {
      request.mockResolvedValue({
        json: () => ({token: 'access token'}),
      });

      const result = await client.exchangeToken('token');
      expect(result).toBe('access token');
    });

    it('when the request errors, it returns an empty string', async () => {
      request.mockRejectedValue('error');

      const result = await client.exchangeToken('token');
      expect(result).toBe('');
    });
  });
});
