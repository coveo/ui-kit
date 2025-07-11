import type {BrowserHistory} from './browser-history';
import type {BrowserLocation} from './browser-location';
import {buildSamlFlow, type SamlFlow, type SamlFlowOptions} from './saml-flow';

describe('buildSamlFlow', () => {
  const handshakeToken = 'token';
  let options: SamlFlowOptions;
  let request: jest.Mock;
  let provider: SamlFlow;

  function initSamlFlow() {
    provider = buildSamlFlow(options);
  }

  function buildMockLocation(): BrowserLocation {
    return {hash: '', href: ''};
  }

  function buildMockHistory(): BrowserHistory {
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

    initSamlFlow();
  });

  describe('#login', () => {
    it('redirects to the expected url', () => {
      const initialLocation = 'http://localhost:8080/#t=All&sort=relevancy';
      options.organizationId = 'org';
      options.provider = 'okta';
      options.location!.href = initialLocation;

      initSamlFlow();

      provider.login();

      const redirectUri = encodeURIComponent(initialLocation);
      const url = `https://platform.cloud.coveo.com/rest/search/v2/login/okta?organizationId=org&redirectUri=${redirectUri}`;

      expect(options.location!.href).toBe(url);
    });

    it('when an origin is specified, the url starts with the origin', () => {
      options.platformOrigin = 'https://platformdev.cloud.coveo.com';
      initSamlFlow();

      provider.login();

      const url = options.location!.href;
      expect(url.startsWith(options.platformOrigin)).toBe(true);
    });
  });

  describe('#exchangeHandshakeToken', () => {
    describe('url hash contains handshake token', () => {
      beforeEach(() => {
        options.organizationId = '1';
        options.location!.hash = `#t=All&sort=relevancy&handshake_token=${handshakeToken}`;

        initSamlFlow();
      });

      it('sends a request with the token', () => {
        provider.exchangeHandshakeToken();

        expect(request).toHaveBeenCalledWith(
          `https://platform.cloud.coveo.com/rest/search/v2/login/handshake/token?organizationId=${options.organizationId}`,
          {
            method: 'POST',
            body: JSON.stringify({handshakeToken}),
            headers: {
              'content-type': 'application/json; charset=UTF-8',
            },
          }
        );
      });

      it('if the organization id has an unsafe url character, it encodes it', () => {
        options.organizationId = '>';
        initSamlFlow();

        provider.exchangeHandshakeToken();
        expect(request).toHaveBeenCalledWith(
          'https://platform.cloud.coveo.com/rest/search/v2/login/handshake/token?organizationId=%3E',
          expect.any(Object)
        );
      });

      it('url hash starts with handshake token param, it exchanges the token', () => {
        options.location!.hash = `#handshake_token=${handshakeToken}`;
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
        expect(options.history!.replaceState).toHaveBeenCalledWith(
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
      options.location!.hash = '#handshake_token=token';
      expect(provider.handshakeTokenAvailable).toBe(true);
    });

    it('hash does not contain handshake token, it returns false', () => {
      options.location!.hash = '';
      expect(provider.handshakeTokenAvailable).toBe(false);
    });
  });

  describe('url hash starts with / followed by handshake token param (Angular bug)', () => {
    beforeEach(() => {
      options.location!.hash = '#/handshake_token=token';
      provider.exchangeHandshakeToken();
    });

    it('exchanges the token', () => {
      assertHandshakeTokenSent();
    });

    it('removes the handshake token from the url but keeps the slash', () => {
      expect(options.history!.replaceState).toHaveBeenCalledWith(
        null,
        '',
        '#/'
      );
    });
  });
});
