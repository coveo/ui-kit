// See https://github.com/GoogleChromeLabs/dark-mode-toggle

declare global {
  interface Window {
    OptanonActiveGroups?: string[];
  }
}

class DarkMode {
  private _themeColor: HTMLMetaElement | null = null;
  private _colorScheme: HTMLMetaElement | null = null;
  private _body: HTMLElement | null = null;

  constructor() {
    if (typeof document !== 'undefined') {
      this._themeColor = document.querySelector('meta[name="theme-color"]');
      this._colorScheme = document.querySelector('meta[name="color-scheme"]');
      this._body = document.body;
      this._onThemeChange();
    }
  }

  private _onThemeChange() {
    // The event fires right before the color scheme goes into effect,
    // so we need the `color` value.
    document.addEventListener('colorschemechange', (e: Event) => {
      if (this._themeColor && this._colorScheme && this._body) {
        this._themeColor.content = getComputedStyle(this._body).color;
        this._colorScheme.content = (e as CustomEvent).detail.colorScheme;
        document.documentElement.dataset.theme = (
          e as CustomEvent
        ).detail.colorScheme;
        this._updateExternalLinkIcons();
      }
    });
  }

  private _updateExternalLinkIcons() {
    const baseUrl = `${window.location.origin}/assets/icons/`;
    const links = document.querySelectorAll('.external-link-icon');

    const imgName =
      this._colorScheme && this._colorScheme.content === 'dark'
        ? 'external-action-4.svg'
        : 'external-action-6.svg';
    links.forEach((link) => {
      link.setAttribute('src', `${baseUrl}${imgName}`);
    });
  }
}

export const implementDarkMode = new DarkMode();
