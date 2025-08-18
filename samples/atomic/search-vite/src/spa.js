// SPA navigation and content swap logic for search-vite demo

// HTML for the two main pages
const pages = {
  home: `<div style="font-size:2rem;text-align:center;padding:2em;">Home page <atomic-search-interface></atomic-search-interface></div>`,
  search: `
    <atomic-search-interface fields-to-include='["snrating", "sncost"]'>
      <atomic-search-layout>
        <div class="header-bg"></div>
        <atomic-layout-section section="search">
          <atomic-search-box></atomic-search-box>
        </atomic-layout-section>
        <atomic-layout-section section="facets">
          <atomic-facet-manager>
            <atomic-automatic-facet-generator desired-count="3"></atomic-automatic-facet-generator>
            <atomic-category-facet field="geographicalhierarchy" label="World Atlas" with-search></atomic-category-facet>
            <atomic-facet field="author" label="Authors"></atomic-facet>
            <atomic-facet field="source" label="Source" display-values-as="link"></atomic-facet>
            <atomic-facet field="year" label="Year" display-values-as="box"></atomic-facet>
            <atomic-numeric-facet field="ytviewcount" label="Youtube Views" depends-on-filetype="YouTubeVideo" with-input="integer"></atomic-numeric-facet>
            <atomic-numeric-facet field="ytlikecount" label="Youtube Likes" depends-on-filetype="YouTubeVideo" display-values-as="link">
              <atomic-numeric-range start="0" end="1000" label="Unpopular"></atomic-numeric-range>
              <atomic-numeric-range start="1000" end="8000" label="Well liked"></atomic-numeric-range>
              <atomic-numeric-range start="8000" end="100000" label="Popular"></atomic-numeric-range>
              <atomic-numeric-range start="100000" end="999999999" label="Treasured"></atomic-numeric-range>
            </atomic-numeric-facet>
            <atomic-numeric-facet field="sncost" label="Cost Range (auto)"><atomic-format-currency currency="CAD"></atomic-format-currency></atomic-numeric-facet>
            <atomic-timeframe-facet label="Timeframe" with-date-picker>
              <atomic-timeframe unit="hour"></atomic-timeframe>
              <atomic-timeframe unit="day"></atomic-timeframe>
              <atomic-timeframe unit="week"></atomic-timeframe>
              <atomic-timeframe unit="month"></atomic-timeframe>
              <atomic-timeframe unit="quarter"></atomic-timeframe>
              <atomic-timeframe unit="year"></atomic-timeframe>
              <atomic-timeframe unit="year" amount="10" period="next"></atomic-timeframe>
            </atomic-timeframe-facet>
            <atomic-rating-facet field="snrating" label="Rating" number-of-intervals="5"></atomic-rating-facet>
            <atomic-rating-range-facet facet-id="snrating_range" field="snrating" label="Rating Range (auto)" number-of-intervals="5"></atomic-rating-range-facet>
            <atomic-color-facet field="filetype" label="Files" number-of-values="6" sort-criteria="occurrences"></atomic-color-facet>
          </atomic-facet-manager>
        </atomic-layout-section>
        <atomic-layout-section section="main">
          <atomic-layout-section section="horizontal-facets">
            <atomic-segmented-facet-scrollable>
              <atomic-segmented-facet field="inat_kingdom" label="Kingdom"></atomic-segmented-facet>
            </atomic-segmented-facet-scrollable>
            <atomic-popover>
              <atomic-facet field="inat_family" label="Family" sort-criteria="alphanumericDescending"></atomic-facet>
            </atomic-popover>
            <atomic-popover>
              <atomic-facet field="inat_class" label="Class"></atomic-facet>
            </atomic-popover>
          </atomic-layout-section>
          <atomic-layout-section section="status">
            <atomic-breadbox></atomic-breadbox>
            <atomic-query-summary></atomic-query-summary>
            <atomic-refine-toggle></atomic-refine-toggle>
            <atomic-sort-dropdown>
              <atomic-sort-expression label="relevance" expression="relevancy"></atomic-sort-expression>
            </atomic-sort-dropdown>
            <atomic-did-you-mean query-correction-mode="next"></atomic-did-you-mean>
            <atomic-notifications></atomic-notifications>
          </atomic-layout-section>
          <atomic-layout-section section="results">
            <atomic-smart-snippet></atomic-smart-snippet>
            <atomic-smart-snippet-suggestions></atomic-smart-snippet-suggestions>
            <atomic-result-list>
              <!-- result templates omitted for brevity -->
            </atomic-result-list>
            <atomic-query-error></atomic-query-error>
            <atomic-no-results></atomic-no-results>
          </atomic-layout-section>
          <atomic-layout-section section="pagination">
            <atomic-load-more-results></atomic-load-more-results>
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-search-layout>
    </atomic-search-interface>
  `,
};

function setActivePage(page) {
  const content = document.getElementById('spa-content');
  if (!content) return;
  content.innerHTML = pages[page];
  // After rendering, update atomic-external's boundInterface
  const atomicExternal = document.querySelector('atomic-external');
  const searchInterface = document.querySelector('atomic-search-interface');
  if (atomicExternal && searchInterface) {
    atomicExternal.boundInterface = searchInterface;
  }
  import('./engine.js').then(({searchEngine}) => {
    customElements.whenDefined('atomic-search-interface').then(() => {
      const searchInterface = document.querySelector('atomic-search-interface');
      searchInterface?.initializeWithSearchEngine?.(searchEngine).then(() => {
        if (page === 'search') {
          searchInterface?.executeFirstSearch?.();
        }
      });
    });
  });
}

export function setupSpaNav() {
  const navBar = document.getElementById('nav-bar');
  if (!navBar) return;
  navBar.innerHTML = `
    <div id="navbar-container">
      <atomic-external>
        <atomic-search-box></atomic-search-box>
      </atomic-external>
      <select id="lang-switcher" style="margin: 0 16px; font-size: 18px;">
        <option value="en">English</option>
        <option value="fr">Français</option>
      </select>
      <a href="#" data-page="home">Home</a>
      <a href="#" data-page="search">Search</a>
    </div>
  `;
  const navbarContainer = document.getElementById('navbar-container');
  navbarContainer.style.display = 'flex';
  navbarContainer.style.justifyContent = 'center';
  navbarContainer.style.width = '100%';
  navbarContainer.style.padding = '10px';
  navbarContainer.style.borderBottom = '1px solid #e5e7eb';
  navbarContainer.style.marginBottom = '20px';
  navbarContainer.style.fontFamily = 'var(--atomic-font-family)';
  const langSwitcher = document.getElementById('lang-switcher');
  langSwitcher.addEventListener('change', (e) => {
    const lang = langSwitcher.value;
    const searchInterface = document.querySelector('atomic-search-interface');
    if (searchInterface) {
      searchInterface.setAttribute('language', lang);
    }
  });

  const navLinks = navbarContainer.querySelectorAll('a');
  navLinks.forEach((link) => {
    link.style.textDecoration = 'none';
    link.style.color = '#333';
    link.style.fontSize = '24px';
    link.style.padding = '8px 16px';
    link.style.display = 'inline-block';
    link.style.transition = 'background-color 0.3s, color 0.3s';
    link.addEventListener('mouseover', () => {
      link.style.color = '#f05245';
    });
    link.addEventListener('mouseout', () => {
      if (!link.classList.contains('active')) {
        link.style.color = '#333';
      }
    });
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navLinks.forEach((l) => l.classList.remove('active'));
      link.classList.add('active');
      link.style.color = '#f05245';
      setActivePage(link.getAttribute('data-page'));
    });
  });
  // Set default page
  setActivePage('home');
}
