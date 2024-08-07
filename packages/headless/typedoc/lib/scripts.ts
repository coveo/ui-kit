interface AtomicSearchInterfaceElement extends HTMLElement {
  initialize(config: {
    organizationId: string;
    organizationEndpoints: organizationEndpoints;
    accessToken: string;
  }): Promise<void>;
  getOrganizationEndpoints(
    organizationId: string
  ): Promise<organizationEndpoints>;
}

interface organizationEndpoints {
  platform: string;
  analytics: string;
  search: string;
  admin: string;
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-search-interface': AtomicSearchInterfaceElement;
  }
}

export function insertLinkAndSearchBox() {
  document.addEventListener('DOMContentLoaded', () => {
    try {
      const generateLinkElement = document.querySelector('.tsd-generator a');
      const link = document.createElement('a');
      Object.assign(link, {
        href: 'https://github.com/dmnsgn/typedoc-material-theme',
        target: '_blank',
        innerText: 'typedoc-material-theme.',
      });
      if (generateLinkElement) {
        generateLinkElement.insertAdjacentElement('afterend', link);
        generateLinkElement.insertAdjacentText('afterend', ' with ');
      }
    } catch (error) {
      /* empty */
    }

    // Insert Atomic search box in the header
    const tsdSearch = document.getElementById('tsd-search');
    if (tsdSearch) {
      tsdSearch.innerHTML = ''; // Clear existing contents

      const searchInterface = document.createElement('atomic-search-interface');
      const searchBox = document.createElement('atomic-search-box');
      searchBox.setAttribute(
        'redirection-url',
        'https://docs.coveo.com/en/search'
      );

      searchInterface.appendChild(searchBox);
      tsdSearch.appendChild(searchInterface);

      // Initialize the search interface with necessary configurations
      (async () => {
        await customElements.whenDefined('atomic-search-interface');
        const searchInterfaceElement = document.querySelector(
          'atomic-search-interface'
        );

        if (searchInterfaceElement) {
          await searchInterfaceElement.initialize({
            organizationId: 'coveosearch',
            organizationEndpoints:
              await searchInterfaceElement.getOrganizationEndpoints(
                'coveosearch'
              ),
            accessToken: 'xx6ac9d08f-eb9a-48d5-9240-d7c251470c93',
          });
        }
      })();
    }
  });
}
