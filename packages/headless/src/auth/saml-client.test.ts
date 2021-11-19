import {getIsomorphicLocation} from './isomorphic-location';
import {buildSamlClient, SamlClient, SamlOptions} from './saml-client';

describe('buildSamlClient', () => {
  let options: SamlOptions;
  let request: jest.Mock<any, any>;
  let client: SamlClient;

  function initSamlClient() {
    client = buildSamlClient({
      ...options,
      request,
    });
  }

  beforeEach(() => {
    options = {
      organizationId: '',
      provider: '',
    };

    request = jest.fn();

    initSamlClient();
  });

  describe('#login', () => {
    // TODO: test POST to avoid writing to url.
    // TODO: url environments

    it('sends the expected request and returns true', async () => {
      const location = getIsomorphicLocation();
      location.href = 'http://localhost:8080/#t=All&sort=relevancy';

      options = {
        organizationId: 'org',
        provider: 'okta',
        location,
      };

      initSamlClient();
      const res = await client.login();

      const redirectUri = encodeURIComponent(location.href);
      const url = `https://platform.cloud.coveo.com/rest/search/v2/login/okta?organizationId=org&redirectUri=${redirectUri}`;

      expect(res).toBe(true);
      expect(request).toHaveBeenCalledWith(url);
    });

    it('when the request errors, it returns false', async () => {
      request.mockRejectedValue('');
      const res = await client.login();
      expect(res).toBe(false);
    });
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
