import {getIsomorphicLocation} from './isomorphic-location';
import {buildSamlClient, SamlClient, SamlOptions} from './saml-client';

describe('buildSamlClient', () => {
  let options: Required<SamlOptions>;
  let request: jest.Mock<any, any>;
  let client: SamlClient;

  function initSamlClient() {
    client = buildSamlClient(options);
  }

  beforeEach(() => {
    request = jest.fn();

    options = {
      organizationId: '',
      provider: '',
      location: getIsomorphicLocation(),
      request,
    };

    initSamlClient();
  });

  describe('#login', () => {
    // TODO: test POST to avoid writing to url.
    // TODO: url environments

    it('sends the expected request and returns true', async () => {
      options.organizationId = 'org';
      options.provider = 'okta';
      options.location.href = 'http://localhost:8080/#t=All&sort=relevancy';

      initSamlClient();

      const res = await client.login();

      const redirectUri = encodeURIComponent(options.location.href);
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
    describe('url hash contains handshake token', () => {
      const handshakeToken = 'token';

      function assertHandshakeTokenSent() {
        expect(request).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({body: JSON.stringify({handshakeToken})})
        );
      }

      beforeEach(() => {
        options.location.hash = `#t=All&sort=relevancy&handshake_token=${handshakeToken}`;
      });

      it('sends a request with the token', () => {
        client.exchangeToken();

        expect(request).toHaveBeenCalledWith(
          'https://platform.cloud.coveo.com/rest/search/login/handshake/token',
          {
            method: 'POST',
            body: JSON.stringify({handshakeToken}),
          }
        );
      });

      it('url hash starts with handshake token param, it exchanges the token', () => {
        options.location.hash = `#handshake_token=${handshakeToken}`;
        client.exchangeToken();

        assertHandshakeTokenSent();
      });

      it(`url hash starts with / followed by handshake token param,
      it exchanges the token`, () => {
        // Angular by default adds a / between the hash and the hash parameters.
        options.location.hash = `#/handshake_token=${handshakeToken}`;
        client.exchangeToken();

        assertHandshakeTokenSent();
      });

      it('returns the access token', async () => {
        request.mockResolvedValue({
          json: () => ({token: 'access token'}),
        });

        const result = await client.exchangeToken();
        expect(result).toBe('access token');
      });

      it('when the request errors, it returns an empty string', async () => {
        request.mockRejectedValue('error');

        const result = await client.exchangeToken();
        expect(result).toBe('');
      });
    });
  });
});
