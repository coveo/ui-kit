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

    window.TypeDoc.disableWritingLocalStorage();
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
    window.TypeDoc.enableLocalStorage();

    // Enable the 'dark-mode-toggle' Theme Selector
    const darkModeToggleSelector = document.querySelector('dark-mode-toggle');
    if (darkModeToggleSelector) {
      darkModeToggleSelector.style.display = 'block';
    }
  }
}

OptanonWrapper();
