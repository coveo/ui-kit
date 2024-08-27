interface AtomicSearchInterfaceElement extends HTMLElement {
  initialize(config: {
    organizationId: string;
    organizationEndpoints: OrganizationEndpoints;
    accessToken: string;
  }): Promise<void>;
  getOrganizationEndpoints(
    organizationId: string
  ): Promise<OrganizationEndpoints>;
}

interface OrganizationEndpoints {
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

export function insertSearchBox() {
  document.addEventListener('DOMContentLoaded', () => {
    const tsdToolbarContents = document.getElementsByClassName(
      'tsd-toolbar-contents'
    )[0];
    if (tsdToolbarContents) {
      const logoCell = document.createElement('div');
      logoCell.classList.add('table-cell', 'coveo-logo-cell');
      const logoDiv = document.createElement('div');
      logoDiv.classList.add('coveo-logo');
      const logoImg = document.createElement('img');
      logoImg.src = 'assets/coveo-docs-logo.svg'; // Update the path as needed
      logoImg.alt = 'Coveo Docs Logo';

      logoDiv.appendChild(logoImg);
      logoCell.appendChild(logoDiv);
      tsdToolbarContents.insertBefore(logoCell, tsdToolbarContents.firstChild);
    }
    const tsdSearch = document.getElementById('tsd-search');
    if (tsdSearch) {
      tsdSearch.innerHTML = ''; // Clear existing contents

      // Create the search interface and search box
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
