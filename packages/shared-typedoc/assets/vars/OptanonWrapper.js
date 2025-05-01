/* eslint-env browser */
function OptanonWrapper() {
  const areFunctionalCookiesEnabled = document.cookie
    .split('; ')
    .some(
      (cookie) =>
        cookie.startsWith('OptanonConsent') && cookie.includes('C0003%3A1')
    );

  if (!areFunctionalCookiesEnabled) {
    // Disable the 'dark-mode-toggle' Theme Selector
    const darkModeToggleSelector = document.querySelector('dark-mode-toggle');
    if (darkModeToggleSelector) {
      darkModeToggleSelector.style.display = 'none';
    }

    // Disable analytics on the atomic-search-interface if it's rendered
    setAtomicSearchInterfaceAnalytics('false');

    waitForTypeDoc().then(() => {
      window.TypeDoc.disableWritingLocalStorage();
    });

    const itemsToDelete = [
      'tsd-theme',
      'filter-protected',
      'filter-inherited',
      'filter-external',
      'dark-mode-toggle',
    ];
    itemsToDelete.forEach((item) => localStorage.removeItem(item));

    const accordionItemsToDelete = [];

    Object.keys(localStorage).forEach((key) => {
      if (key.includes('tsd-accordion')) {
        accordionItemsToDelete.push(key);
      }
    });

    accordionItemsToDelete.forEach((item) => localStorage.removeItem(item));
  } else {
    waitForTypeDoc().then(() => {
      window.TypeDoc.enableLocalStorage();
    });

    // Enable the 'dark-mode-toggle' Theme Selector
    const darkModeToggleSelector = document.querySelector('dark-mode-toggle');
    if (darkModeToggleSelector) {
      darkModeToggleSelector.style.display = 'block';
    }

    // Enable analytics on the atomic-search-interface if it's rendered
    setAtomicSearchInterfaceAnalytics('true');
  }
}

async function isTypeDocLoaded() {
  return new Promise((resolve) => {
    if (window.TypeDoc) {
      resolve(true);
    } else {
      setTimeout(() => {
        resolve(false);
      }, 100);
    }
  });
}

async function waitForTypeDoc(timeout = 5000) {
  const start = Date.now();
  while (!(await isTypeDocLoaded())) {
    if (Date.now() - start > timeout) {
      throw new Error('Timed out waiting for Typedoc to load');
    }
  }
}

function setAtomicSearchInterfaceAnalytics(val) {
  const atomicSearchInterface = document.querySelector(
    'atomic-search-interface'
  );
  if (atomicSearchInterface) {
    atomicSearchInterface.setAttribute('analytics', val);
  }
  if (val === 'false') {
    localStorage.removeItem('visitorId');
  }
}

OptanonWrapper();
