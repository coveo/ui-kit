export function insertOneTrust() {
  document.addEventListener('DOMContentLoaded', () => {
    const areFunctionalCookiesEnabled = document.cookie
      .split('; ')
      .some(
        (cookie) =>
          cookie.startsWith('OptanonConsent') &&
          cookie.includes('groups=C0003:1')
      );

    if (!areFunctionalCookiesEnabled) {
      const settingsDiv = document.querySelector('.settings');
      if (settingsDiv) {
        (settingsDiv as HTMLElement).style.display = 'none';
      }

      const itemsToDelete = [
        'tsd-theme',
        'filter-protected',
        'filter-inherited',
        'filter-external',
      ];
      itemsToDelete.forEach((item) => localStorage.removeItem(item));
    }
  });
}
