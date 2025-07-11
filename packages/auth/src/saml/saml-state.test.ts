import type {BrowserStorage} from './browser-storage';
import {buildSamlState, type SamlState} from './saml-state';

describe('buildSamlState', () => {
  let storage: BrowserStorage;
  let samlState: SamlState;

  function buildMockStorage(): BrowserStorage {
    return {
      getItem: jest.fn(),
      removeItem: jest.fn(),
      setItem: jest.fn(),
    };
  }

  function initSamlState() {
    samlState = buildSamlState({storage});
  }

  beforeEach(() => {
    storage = buildMockStorage();
    initSamlState();
  });

  it('#setLoginPending sets the "samlLoginPending" to true', () => {
    samlState.setLoginPending();

    expect(storage.setItem).toBeCalledWith('samlLoginPending', 'true');
  });

  describe('#isLoginPending', () => {
    it('when #storage.getItem returns "true"', () => {
      (storage.getItem as jest.Mock).mockReturnValue('true');
      expect(samlState.isLoginPending).toBe(true);
    });

    it('when #storage.getItem returns null', () => {
      (storage.getItem as jest.Mock).mockReturnValue(null);
      expect(samlState.isLoginPending).toBe(false);
    });
  });

  it('#removeLoginPending', () => {
    samlState.removeLoginPending();
    expect(storage.removeItem).toBeCalledWith('samlLoginPending');
  });
});
