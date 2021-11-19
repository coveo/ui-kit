import {IsomorphicHistory} from './isomorphic-history';
import {IsomorphicLocation} from './isomorphic-location';
import {buildSamlClient, SamlClient, SamlOptions} from './saml-client';

describe('buildSamlClient', () => {
  const handshakeToken = 'token';
  let options: Required<SamlOptions>;
  let request: jest.Mock<any, any>;
  let client: SamlClient;

  function initSamlClient() {
    client = buildSamlClient(options);
  }

  function buildMockLocation(): IsomorphicLocation {
    return {hash: '', href: ''};
  }

  function buildMockHistory(): IsomorphicHistory {
    return {replaceState: jest.fn()};
  }

  function assertHandshakeTokenSent() {
    expect(request).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({body: JSON.stringify({handshakeToken})})
    );
  }

  beforeEach(() => {
    request = jest.fn();

    options = {
      organizationId: '',
      provider: '',
      location: buildMockLocation(),
      history: buildMockHistory(),
      request,
    };

    initSamlClient();
  });

  describe('#authenticate', () => {
    it('hash does not contain token, it calls #login', () => {
      options.location.hash = '';
      const spy = spyOn(client, 'login');

      client.authenticate();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('hash contains token, it calls #exchangeToken and returns an access token', async () => {
      options.location.hash = '#handshake_token=token';

      const spy = spyOn(client, 'exchangeToken');
      spy.and.returnValue('access token');

      const res = await client.authenticate();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(res).toBe('access token');
    });
  });

  describe('#login', () => {
    // TODO: test POST to avoid writing to url.
    // TODO: url environments

    it('redirects to the expected url', () => {
      const initialLocation = 'http://localhost:8080/#t=All&sort=relevancy';
      options.organizationId = 'org';
      options.provider = 'okta';
      options.location.href = initialLocation;

      initSamlClient();

      client.login();

      const redirectUri = encodeURIComponent(initialLocation);
      const url = `https://platform.cloud.coveo.com/rest/search/v2/login/okta?organizationId=org&redirectUri=${redirectUri}`;

      expect(options.location.href).toBe(url);
    });
  });

  describe('#exchangeToken', () => {
    describe('url hash contains handshake token', () => {
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

      it('returns the access token', async () => {
        request.mockResolvedValue({
          json: () => ({token: 'access token'}),
        });

        const result = await client.exchangeToken();
        expect(result).toBe('access token');
      });

      it('it removes the handshake token from the hash', () => {
        client.exchangeToken();
        expect(options.history.replaceState).toHaveBeenCalledWith(
          null,
          '',
          '#t=All&sort=relevancy'
        );
      });

      it('when the request errors, it returns an empty string', async () => {
        request.mockRejectedValue('error');

        const result = await client.exchangeToken();
        expect(result).toBe('');
      });
    });
  });

  describe('url hash starts with / followed by handshake token param (Angular bug)', () => {
    beforeEach(() => {
      options.location.hash = `#/handshake_token=${handshakeToken}`;
      client.exchangeToken();
    });

    it('exchanges the token', () => {
      assertHandshakeTokenSent();
    });

    it('removes the handshake token from the url but keeps the slash', () => {
      expect(options.history.replaceState).toHaveBeenCalledWith(null, '', '#/');
    });
  });
});
