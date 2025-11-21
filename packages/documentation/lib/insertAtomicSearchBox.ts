interface AtomicSearchInterfaceElement extends HTMLElement {
  initialize(config: {
    organizationId: string;
    accessToken: string;
    search: {searchHub: string};
    analytics: {originLevel2: string};
  }): Promise<void>;
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-search-interface': AtomicSearchInterfaceElement;
  }
}

export const insertAtomicSearchBox = () => {
  const areFunctionalCookiesEnabled = (): boolean => {
    return document.cookie
      .split('; ')
      .some(
        (cookie) =>
          cookie.startsWith('OptanonConsent') && cookie.includes('C0003%3A1')
      );
  };

  document.addEventListener('DOMContentLoaded', () => {
    const typedocSearchBox = document.getElementById('tsd-search');
    if (typedocSearchBox) {
      typedocSearchBox.innerHTML = '';
      const searchInterface = document.createElement('atomic-search-interface');
      const initializeAnalytics = areFunctionalCookiesEnabled();
      searchInterface.setAttribute('analytics', `${initializeAnalytics}`);
      const searchBox = document.createElement('atomic-search-box');
      searchBox.setAttribute(
        'redirection-url',
        'https://docs.coveo.com/en/search'
      );
      searchInterface.appendChild(searchBox);
      typedocSearchBox.appendChild(searchInterface);

      (async () => {
        await customElements.whenDefined('atomic-search-interface');
        const searchInterfaceElement = document.querySelector(
          'atomic-search-interface'
        );
        if (searchInterfaceElement) {
          await searchInterfaceElement.initialize({
            organizationId: 'coveosearch',
            accessToken: 'xx6ac9d08f-eb9a-48d5-9240-d7c251470c93',
            search: {searchHub: 'Coveo Docs Unified Search'},
            analytics: {originLevel2: 'All'},
          });
        }
      })();
    }
  });
};
