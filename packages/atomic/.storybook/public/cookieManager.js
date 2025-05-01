const FUNCTIONAL_COOKIE_CATEGORY = 'C0003%3A1';

const functionalKeys = {
  enabled: false,
  localStorageKeys: [
    '@storybook/manager/store',
    'lastViewedStoryIds',
    '__storage_test__',
    '__store2_test',
  ],
};

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
  const originalLocalStorage = window.localStorage;

  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (key) => {
        if (blockedKeys.includes(key)) {
          return null;
        }
        return originalLocalStorage.getItem(key);
      },
      setItem: (key, value) => {
        if (blockedKeys.includes(key)) {
          return;
        }
        return originalLocalStorage.setItem(key, value);
      },
      removeItem(key) {
        return originalLocalStorage.removeItem(key);
      },
      clear() {
        return originalLocalStorage.clear();
      },
      key(index) {
        return originalLocalStorage.key(index);
      },
      get length() {
        return originalLocalStorage.length;
      },
    },
  });
}

function removeBlockedKeys(blockedLocalStorageKeys) {
  blockedLocalStorageKeys.forEach((key) => {
    window.localStorage.removeItem(key);
  });
}
