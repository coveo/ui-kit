export const insertSiteHeaderBar = (assetsPath: string) => {
  const isDefaultUserDarkTheme =
    window.matchMedia('(prefers-color-scheme: dark)').matches ||
    window.matchMedia('(prefers-color-scheme:dark)').matches;
  const userDefaultTheme = isDefaultUserDarkTheme ? 'dark' : 'light';
  const theme = localStorage.getItem('dark-mode-toggle')
    ? localStorage.getItem('dark-mode-toggle')
    : userDefaultTheme;

  const externalLinkIcon =
    theme === 'dark' ? 'external-action-4.svg' : 'external-action-6.svg';

  document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementsByTagName('header')[0];
    if (header) {
      const newHeader = document.createElement('header');
      newHeader.classList.add('site-header', 'sticky-top');
      newHeader.setAttribute('role', 'banner');
      newHeader.innerHTML = `
        <nav class="navbar navbar-expand-md site-navbar px-md-81 py-125">
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
        </nav>`;

      if (header.parentNode) {
        header.parentNode.replaceChild(newHeader, header);
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
