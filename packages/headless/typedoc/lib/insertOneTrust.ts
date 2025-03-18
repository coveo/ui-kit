declare global {
  interface Window {
    TypeDoc: {
      disableLocalStorage: () => void;
      enableLocalStorage: () => void;
    };
  }
}

export function insertOneTrust() {
  document.addEventListener('DOMContentLoaded', () => {
    const areFunctionalCookiesEnabled = document.cookie
      .split('; ')
      .some(
        (cookie) =>
          cookie.startsWith('OptanonConsent') && cookie.includes('C0003%3A1')
      );

    if (!areFunctionalCookiesEnabled) {
      const settingsDiv = document.querySelector('.settings');
      if (settingsDiv) {
        (settingsDiv as HTMLElement).style.display = 'none';
      }
      window.TypeDoc.disableLocalStorage();
    } else {
      window.TypeDoc.enableLocalStorage();
    }
  });
}
