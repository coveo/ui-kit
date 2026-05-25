const FUNCTIONAL_COOKIE_CATEGORY = 'C0003%3A1';

const functionalKeys = {
  enabled: false,
  localStorageKeys: [
    'storybook/internal/manager/store',
    'lastViewedStoryIds',
    '__storage_test__',
    '__store2_test',
  ],
};

const originalLocalStorage = window.localStorage;

export const getOptanonConsentCookie = () => {
  return document.cookie.split(';').find((cookie) => {
    return cookie.trim().startsWith('OptanonConsent=');
  });
};

export const updateCookieSettings = () => {
  const optanonConsentCookie = getOptanonConsentCookie();
  if (optanonConsentCookie) {
    functionalKeys.enabled = optanonConsentCookie.includes(
      FUNCTIONAL_COOKIE_CATEGORY
    );
  }
};

export const disableBlockedKeys = () => {
  if (!functionalKeys.enabled) {
    disableLocalStorageForBlockedKeys(functionalKeys.localStorageKeys);
    removeBlockedKeys(functionalKeys.localStorageKeys);
  }
};

function disableLocalStorageForBlockedKeys(blockedKeys) {
  const proxiedMethods = ['getItem', 'setItem'];
  const handler = {
    get(target, prop, receiver) {
      return proxiedMethods.includes(prop)
        ? (key) => (blockedKeys.includes(key) ? undefined : target[prop](key))
        : Reflect.get(target, prop, receiver);
    },
  };

  Object.defineProperty(window, 'localStorage', {
    value: new Proxy(originalLocalStorage, handler),
    configurable: true,
    writeable: true,
  });
}

function removeBlockedKeys(blockedLocalStorageKeys) {
  blockedLocalStorageKeys.forEach((key) => {
    originalLocalStorage.removeItem(key);
  });
}
