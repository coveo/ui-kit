import {
  buildSamlClient,
  type SamlClient,
  type SamlClientOptions,
} from './saml-client';
import * as SamlFlow from './saml-flow';
import * as SamlState from './saml-state';

describe('buildSamlClient', () => {
  let options: SamlClientOptions;
  let client: SamlClient;
  let samlFlow: SamlFlow.SamlFlow;
  let samlState: SamlState.SamlState;

  function buildMockSamlFlow(): SamlFlow.SamlFlow {
    return {
      exchangeHandshakeToken: jest.fn().mockResolvedValue(''),
      handshakeTokenAvailable: false,
      login: jest.fn(),
    };
  }

  function buildMockSamlState(): SamlState.SamlState {
    return {
      isLoginPending: false,
      removeLoginPending: jest.fn(),
      setLoginPending: jest.fn(),
    };
  }

  beforeEach(() => {
    samlFlow = buildMockSamlFlow();
    jest.spyOn(SamlFlow, 'buildSamlFlow').mockReturnValue(samlFlow);

    samlState = buildMockSamlState();
    jest.spyOn(SamlState, 'buildSamlState').mockReturnValue(samlState);

    console.warn = jest.fn();

    options = {
      organizationId: '',
      provider: '',
    };

    client = buildSamlClient(options);
  });

  describe('#authenticate, handshake token not available', () => {
    describe('#isLoginPending is true', () => {
      beforeEach(() => {
        samlState.isLoginPending = true;
        client.authenticate();
      });

      it('does not call #login', () => {
        expect(samlFlow.login).not.toHaveBeenCalled();
      });

      it('removes the login pending flag', () => {
        expect(samlState.removeLoginPending).toHaveBeenCalled();
      });

      it('logs a warning', () => {
        expect(console.warn).toHaveBeenCalled();
      });
    });

    describe('#isLoginPending is false', () => {
      beforeEach(() => {
        samlFlow.handshakeTokenAvailable = false;
        client.authenticate();
      });

      it('calls #login', () => {
        expect(samlFlow.login).toHaveBeenCalledTimes(1);
      });

      it('sets the login pending flag', () => {
        expect(samlState.setLoginPending).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('#authenticate, handshake token available', () => {
    const accessToken = 'access token';

    beforeEach(() => {
      samlFlow.handshakeTokenAvailable = true;
      samlFlow.exchangeHandshakeToken = jest
        .fn()
        .mockResolvedValue(accessToken);
    });

    it('calls #exchangeHandshakeToken and returns an access token', async () => {
      const res = await client.authenticate();
      expect(samlFlow.exchangeHandshakeToken).toHaveBeenCalledTimes(1);
      expect(res).toBe(accessToken);
    });

    it('removes the pending flag', () => {
      client.authenticate();
      expect(samlState.removeLoginPending).toHaveBeenCalledTimes(1);
    });
  });
});
