export const insertSiteHeaderBar = (
  assetsPath: string,
  activeEntry: string
) => {
  const isDefaultUserDarkTheme =
    window.matchMedia('(prefers-color-scheme: dark)').matches ||
    window.matchMedia('(prefers-color-scheme:dark)').matches;
  const userDefaultTheme = isDefaultUserDarkTheme ? 'dark' : 'light';
  const theme = localStorage.getItem('dark-mode-toggle')
    ? localStorage.getItem('dark-mode-toggle')
    : userDefaultTheme;

  const externalLinkIcon =
    theme === 'dark' ? 'external-action-4.svg' : 'external-action-6.svg';

  const devToolsEntries = [
    {title: 'Atomic', href: 'https://docs.coveo.com/en/atomic/latest/'},
    {
      title: 'Atomic reference',
      href: 'https://static.cloud.coveo.com/atomic/v3/storybook/index.html',
      external: true,
    },
    {
      title: 'Headless',
      href: 'https://docs.coveo.com/en/headless/latest/reference/documents/index.html',
    },
    {
      title: 'Headless React',
      href: 'https://docs.coveo.com/en/headless-react/latest/reference/index.html',
    },
    {
      title: 'Quantic',
      href: 'https://docs.coveo.com/en/quantic/latest/',
    },
    {title: 'Relay', href: 'https://docs.coveo.com/en/relay/latest/'},
    {divider: true},
    {
      title: 'Atomic for commerce',
      href: 'https://docs.coveo.com/en/p8bd0068/',
    },
    {
      title: 'Headless for commerce',
      href: 'https://docs.coveo.com/en/o52e9091/',
    },
    {divider: true},
    {title: 'Coveo CLI', href: 'https://docs.coveo.com/en/cli/'},
  ] as const;

  const apiRefEntries = [
    {title: 'Commerce API', href: 'https://docs.coveo.com/en/103'},
    {title: 'Customer Service API', href: 'https://docs.coveo.com/en/3430'},
    {title: 'Field API', href: 'https://docs.coveo.com/en/8'},
    {title: 'Push API', href: 'https://docs.coveo.com/en/12'},
    {title: 'Search API', href: 'https://docs.coveo.com/en/13'},
    {title: 'Source API', href: 'https://docs.coveo.com/en/15'},
    {
      title: 'Usage Analytics Write API',
      href: 'https://docs.coveo.com/en/18',
    },
    {divider: true},
    {title: 'View all', href: 'https://docs.coveo.com/en/4/'},
  ] as const;

  function renderDropdownItems(
    entries: ReadonlyArray<
      {title: string; href: string; external?: boolean} | {divider: true}
    >,
    activeTitle: string
  ): string {
    return entries
      .map((e) => {
        if ('divider' in e) return '<li><hr class="dropdown-divider"></li>';
        const active = e.title === activeTitle ? ' active' : '';
        const target = e.external
          ? ' target="_blank" rel="noopener noreferrer"'
          : '';
        const extIcon = e.external
          ? ` <img data-ot-ignore class="external-link-icon" src="${assetsPath}/icons/${externalLinkIcon}">`
          : '';
        return `<li><a class="dropdown-item header-nav-dropdown-item fs-87 fw-300${active}" href="${e.href}"${target}>${e.title}${extIcon}</a></li>`;
      })
      .join('');
  }

  function renderDropdown(
    id: string,
    label: string,
    entries: ReadonlyArray<
      {title: string; href: string; external?: boolean} | {divider: true}
    >,
    isActive: boolean,
    activeTitle: string
  ): string {
    return `
      <div class="btn-group header-nav-dropdown${isActive ? ' active' : ''}" data-dropdown-id="${id}">
        <button type="button"
          class="btn header-nav-label dropdown-toggle fs-100 fw-400${isActive ? ' active' : ''}"
          data-bs-toggle="dropdown" aria-expanded="false">
          ${label}
        </button>
        <ul class="dropdown-menu header-nav-dropdown rounded-4">
          ${renderDropdownItems(entries, activeTitle)}
        </ul>
      </div>`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementsByTagName('header')[0];
    if (header) {
      const newHeader = document.createElement('header');
      newHeader.classList.add('site-header', 'sticky-top');
      newHeader.setAttribute('role', 'banner');
      newHeader.innerHTML = `
        <nav class="navbar navbar-expand-md site-navbar px-md-81 pt-125 pb-0">
          <div class="container-fluid px-0">
            <a href="https://docs.coveo.com/en/0/">
              <img id="docs-logo" class="h-rem300" src="${assetsPath}/icons/coveo-docs-logo.svg">
            </a>
            <button class="navbar-toggler site-navbar-toggler h-rem237 border-0" type="button" data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false"
              aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse justify-content-end" id="navbarSupportedContent">
              <div class="navbar-search w-100" id="tsd-search">
              </div>
              <div class="btn-toolbar navbar-buttons flex-nowrap justify-content-center justify-content-md-end" role="toolbar"
                aria-label="Navbar buttons">
                <div class="btn-group py-81 py-md-0" role="group" aria-label="Navigation links">
                  <button type="button" class="btn site-navbar-btn">
                    <a href="https://docs.google.com/forms/d/e/1FAIpQLSeyNL18g4JWIDR5xEyIMY48JIjyjwXRmlCveecjXBNSLh4Ygg/viewform?usp=sf_link"
                      class="navbar-link fs-75 fw-400" target="_blank">Feedback</a>
                  </button>
                  <button type="button" class="btn btn-primary rounded">
                    <a href="https://www.coveo.com/en/free-trial" target="_blank"
                      class="marketing-header navbar-button fs-75 fw-400 text-nowrap">Get a free trial</a>
                  </button>
                </div>

                <div class="btn-group" aria-label="Site settings">
                  <button type="button" class="btn dropdown-toggle settings-dropdown w-rem300 fs-75 fw-300"
                    data-bs-toggle="dropdown" aria-expanded="false">
                    <img src="${assetsPath}/icons/more.svg" class="w-rem125">
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end settings-dropdown-menu position-absolute rounded-4">
                    <li><span class="dropdown-item-text dropdown-settings-text">More</span></li>
                    <li style="cursor:pointer;"><a class="dropdown-item settings-dropdown-item fs-75 fw-300"
                        href="https://docs.coveo.com/en/3378/">Product news</a></li>
                    <li style="cursor:pointer;"><a class="settings-dropdown-item dropdown-item fs-75 fw-300"
                        href="https://connect.coveo.com/" target="_blank">
                        Community
                        <img data-ot-ignore class="external-link-icon" src="${assetsPath}/icons/${externalLinkIcon}">
                        </a>
                    </li>
                    <li style="cursor:pointer;"><a class="settings-dropdown-item dropdown-item fs-75 fw-300"
                        href="https://connect.coveo.com/s/case/Case/Default" target="_blank">
                        Support
                        <img data-ot-ignore class="external-link-icon" src="${assetsPath}/icons/${externalLinkIcon}">
                        </a>
                    </li>
                      <hr class="dropdown-divider">
                    </li>
                    <li><span class="dropdown-item-text dropdown-settings-text">Settings</span></li>
                    <li><dark-mode-toggle class="px-75" legend="Dark mode" light="off" dark="on" permanent></dark-mode-toggle>
                    </li>
                    <li style="cursor:pointer;"><a class="dropdown-item settings-dropdown-item fs-75 fw-300"
                        onclick="OneTrust.ToggleInfoDisplay()">Cookie preferences</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <div class="header-nav-bar d-none d-md-flex px-md-81">
          <a class="btn header-nav-label fs-100 fw-400" href="https://docs.coveo.com/en/3361/">Coveo Platform</a>
          <a class="btn header-nav-label fs-100 fw-400" href="https://docs.coveo.com/en/1495/">Solutions &amp; integrations</a>
          <a class="btn header-nav-label fs-100 fw-400" href="https://docs.coveo.com/en/q4ke0131/">Resources</a>
          <div class="flex-grow-1"></div>
          ${renderDropdown('api-reference', 'API reference', apiRefEntries, false, '')}
          ${renderDropdown('developer-tools', 'Developer tools', devToolsEntries, true, activeEntry)}
          <a id="tsd-edit-github-link" href="#" target="_blank" rel="noopener noreferrer" title="Edit in GitHub" aria-label="Edit in GitHub" class="btn header-nav-label d-flex align-items-center" style="display:none">
            <img src="${assetsPath}/icons/github.svg" width="20" height="20" aria-hidden="true" style="flex-shrink:0;display:block;filter:brightness(0) invert(1)" alt="">
          </a>
        </div>`;

      if (header.parentNode) {
        header.parentNode.replaceChild(newHeader, header);
      }

      const githubMeta = document.querySelector('meta[name="github-edit-url"]');
      const editLink = document.getElementById('tsd-edit-github-link');

      // Resolve content safely, prefer empty string if missing.
      const url = githubMeta?.getAttribute('content') ?? '';

      if (editLink && url.trim() && url !== '#') {
        (editLink as HTMLAnchorElement).href = url;
        (editLink as HTMLElement).style.display = 'flex';
      }

      header.setAttribute('data-bs-theme', 'light');
      document.body.setAttribute('data-bs-theme', 'light');

      const faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      faviconLink.href = `${assetsPath}/favicon.ico`;
      document.head.appendChild(faviconLink);
    }
  });
};
