import {IsomorphicHistory} from './isomorphic-history';
import {IsomorphicLocation} from './isomorphic-location';
import {
  buildSamlProvider,
  SamlProvider,
  SamlProviderOptions,
} from './saml-provider';

describe('buildSamlProvider', () => {
  const handshakeToken = 'token';
  let options: Required<SamlProviderOptions>;
  let request: jest.Mock<any, any>;
  let provider: SamlProvider;

  function initSamlProvider() {
    provider = buildSamlProvider(options);
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

    initSamlProvider();
  });

  describe('#login', () => {
    // TODO: test POST to avoid writing to url.
    // TODO: url environments

    it('redirects to the expected url', () => {
      const initialLocation = 'http://localhost:8080/#t=All&sort=relevancy';
      options.organizationId = 'org';
      options.provider = 'okta';
      options.location.href = initialLocation;

      initSamlProvider();

      provider.login();

      const redirectUri = encodeURIComponent(initialLocation);
      const url = `https://platform.cloud.coveo.com/rest/search/v2/login/okta?organizationId=org&redirectUri=${redirectUri}`;

      expect(options.location.href).toBe(url);
    });
  });

  describe('#exchangeHandshakeToken', () => {
    // TODO: api key should not be required.

    describe('url hash contains handshake token', () => {
      beforeEach(() => {
        options.location.hash = `#t=All&sort=relevancy&handshake_token=${handshakeToken}`;
      });

      it('sends a request with the token', () => {
        provider.exchangeHandshakeToken();

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
        provider.exchangeHandshakeToken();

        assertHandshakeTokenSent();
      });

      it('returns the access token', async () => {
        request.mockResolvedValue({
          json: () => ({token: 'access token'}),
        });

        const result = await provider.exchangeHandshakeToken();
        expect(result).toBe('access token');
      });

      it('it removes the handshake token from the hash', () => {
        provider.exchangeHandshakeToken();
        expect(options.history.replaceState).toHaveBeenCalledWith(
          null,
          '',
          '#t=All&sort=relevancy'
        );
      });

      it('when the request errors, it returns an empty string', async () => {
        request.mockRejectedValue('error');

        const result = await provider.exchangeHandshakeToken();
        expect(result).toBe('');
      });
    });
  });

  describe('#handshakeTokenAvailable', () => {
    it('hash contains handshake token, it returns true', () => {
      options.location.hash = '#handshake_token=token';
      expect(provider.handshakeTokenAvailable).toBe(true);
    });

    it('hash does not contain handshake token, it returns false', () => {
      options.location.hash = '';
      expect(provider.handshakeTokenAvailable).toBe(false);
    });
  });

  describe('url hash starts with / followed by handshake token param (Angular bug)', () => {
    beforeEach(() => {
      options.location.hash = '#/handshake_token=token';
      provider.exchangeHandshakeToken();
    });

    it('exchanges the token', () => {
      assertHandshakeTokenSent();
    });

    it('removes the handshake token from the url but keeps the slash', () => {
      expect(options.history.replaceState).toHaveBeenCalledWith(null, '', '#/');
    });
  });
});
