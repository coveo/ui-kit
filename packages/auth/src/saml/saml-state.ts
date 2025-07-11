import {type BrowserStorage, getBrowserStorage} from './browser-storage';

interface SamlStateOptions {
  storage?: BrowserStorage;
}

export interface SamlState {
  isLoginPending: boolean;
  removeLoginPending(): void;
  setLoginPending(): void;
}

export function buildSamlState(config: SamlStateOptions = {}): SamlState {
  const loginPendingFlag = 'samlLoginPending';
  const storage = config.storage || getBrowserStorage();

  return {
    get isLoginPending() {
      return storage.getItem(loginPendingFlag) === 'true';
    },

    removeLoginPending() {
      storage.removeItem(loginPendingFlag);
    },

    setLoginPending() {
      storage.setItem(loginPendingFlag, 'true');
    },
  };
}
