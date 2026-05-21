/* eslint-env browser */
// Analytics helper for Typedoc docs.
// Mirrors the pattern used by the Jekyll docs site (assets/js/amplitude.js),
// with the addition of pre-consent buffering and Typedoc-specific event handlers.

class DocsAnalytics {
  constructor() {
    this.isInit = false;
    this._disabled = false;
    // Events buffered before onetrust.js calls init()
    this._buffer = [];
    this._attachDefaultHandlers();
  }

  // Mirrors Jekyll: selectAmplitudeKey()
  selectAmplitudeKey() {
    const allowedHosts = ['docs.coveo.com'];
    const url = new URL(window.location.href);
    return allowedHosts.includes(url.host)
      ? 'ca7130edf650105fc3550fb538bcdd95'
      : 'dc44628be4bc3b55860e60d1637ee897';
  }

  // Mirrors Jekyll: initAmplitude()
  // Called by onetrust.js when C0003 functional consent is granted.
  initAmplitude() {
    if (window.amplitude && !this.isInit) {
      const apiKey = this.selectAmplitudeKey();
      
      // Enrichment plugin: adds headless/typedoc version + pageId to ALL events (including autocapture)
      const enrichmentPlugin = () => ({
        name: 'docs-enrichment',
        type: 'enrichment',
        setup: async () => undefined,
        execute: async (event) => {
          event.event_properties = event.event_properties || {};
          event.event_properties.headlessVersionConsulted =
            document.documentElement?.getAttribute('data-headless-version') || '';
          event.event_properties.typedocVersionConsulted = window.__TYPEDOC_VERSION__ || '';
          return event;
        },
      });

      window.amplitude.init(apiKey, {
        autocapture: {
          elementInteractions: false,
          formInteractions: false,
        },
      });
      window.amplitude.add(enrichmentPlugin());
    }
    this.isInit = true;
    this._disabled = false;
    // Flush events buffered before consent
    this._buffer.splice(0).forEach(({name, props}) =>
      window.amplitude && window.amplitude.track(name, props)
    );
  }

  // Mirrors Jekyll: trackEvent()
  // Enriches properties with URL/page metadata then delegates to window.amplitude.
  trackEvent(eventName, eventProperties = {}) {
    const url = new URL(window.location.href);
    eventProperties.pageUrl = url.href;
    eventProperties.pageId =
      document.documentElement?.getAttribute('data-page-id') || '';
    eventProperties.typedocVersionConsulted = window.__TYPEDOC_VERSION__ || '';
    eventProperties.headlessVersionConsulted =
      document.documentElement?.getAttribute('data-headless-version') || '';

    if (window.amplitude) {
      window.amplitude.track(eventName, eventProperties);
    }
  }

  // Mirrors Jekyll: setOptOut()
  // Called by onetrust.js when C0003 consent is denied or withdrawn.
  setOptOut(isOptOut) {
    this._disabled = isOptOut;
    this.isInit = !isOptOut;
    if (isOptOut) {
      this._buffer = [];
    }
    if (window.amplitude) {
      window.amplitude.setOptOut(isOptOut);
    }
  }

  // --- Typedoc-specific additions below ---

  _isExternalLink(anchor) {
    try {
      return new URL(anchor.href, location.href).hostname !== location.hostname;
    } catch {
      return false;
    }
  }

  _trackPageView() {
    // Amplitude's autocapture already fires '[Amplitude] Page Viewed' for normal
    // page views, so we only need to track the 404 case explicitly.
    const is404 =
      document.querySelector('meta[name="pageLayout"]')?.content === '404-page' ||
      document.title.includes('404') ||
      location.pathname.includes('404');

    if (is404) {
      this.track('Page', {
        eventType: '404 - Missing Content',
        pageNativeURL: location.href,
        reason: 'missing_content',
      });
    }
  }

  _handleLinkClick(a) {
    // Settings dropdown items are handled exclusively by _attachNavBarTracking.
    // Guard here to prevent them also firing as external links.
    if (a.classList.contains('settings-dropdown-item')) return;

    // Navbar buttons (Feedback, Get a free trial) get dedicated event names
    if (a.classList.contains('navbar-link')) {
      this.track('Feedback Button Clicked', {cTarget: a.href || ''});
      return;
    }
    if (a.classList.contains('marketing-header')) {
      this.track('Get a Free Trial Button Clicked', {cTarget: a.href || ''});
      return;
    }

    if (a.matches('.edit-in-github-btn') || a.id === 'edit-in-github-btn') {
      this.track('Misc', {
        section: 'Edit Docs In GitHub',
        cLabel: 'Edit in GitHub button',
        cTarget: a.href,
      });
      return;
    }

    const cLabel = (a.textContent || '').trim().slice(0, 200);
    const cTarget = a.href || '';

    if (this._isExternalLink(a)) {
      this.track('Page Nav', {section: 'External Link', cLabel, cTarget});
      return;
    }

    const inToc = !!a.closest('.tsd-navigation, .site-menu');
    this.track(inToc ? 'TOC Interact' : 'Page Nav', {
      section: inToc ? 'TOC' : 'In Article',
      cLabel,
      cTarget,
    });
  }

  _attachDefaultHandlers() {
    this._attachPageViewTracking();
    this._attachLinkClickTracking();
    this._attachNavBarTracking();
    this._attachCodeCopyTracking();
  }

  _attachPageViewTracking() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this._trackPageView());
    } else {
      this._trackPageView();
    }
  }

  _attachLinkClickTracking() {
    // Covers TOC, in-article, external links, and edit-in-GitHub.
    // Settings dropdown items are intentionally excluded (see _handleLinkClick guard).
    document.addEventListener('click', (e) => {
      const a = e.target.closest?.('a');
      if (a) this._handleLinkClick(a);
    }, true);
  }

  _attachNavBarTracking() {
    // Dark mode: <dark-mode-toggle> dispatches 'colorschemechange' (bubbles: true)
    document.addEventListener('colorschemechange', () => {
      this.track('Dark Mode Toggle');
    });

    // Settings dropdown links (Community, Support…) injected by insertSiteHeaderBar.
    document.addEventListener('click', (e) => {
      // e.target could be the <a>, or a child element like <img> inside it.
      // Use closest from the event target to walk up the DOM tree.
      const a = e.target.closest && e.target.closest('a.settings-dropdown-item');
      if (!a) return;
      const label = (a.textContent || '').trim().replace(/\s+/g, ' ');
      this.track(`${label} Button Clicked`, {
        cTarget: a.href || '',
      });
    }, true);
  }

  _attachCodeCopyTracking() {
    // Copy buttons in code blocks: <pre><code>...</code><button>Copy</button></pre>
    // Typedoc's main.js attaches click handlers that change textContent to "Copied!"
    document.addEventListener('click', (e) => {
      const btn = e.target.closest && e.target.closest('pre > button');
      if (!btn) return;

      // Extract context from the code block
      const pre = btn.parentElement;
      const code = pre?.querySelector('code');
      
      let language = '';
      let codeSnippet = '';
      
      if (code) {
        // Extract language from class (e.g., "language-typescript" → "typescript")
        const langClass = Array.from(code.classList).find(cls => cls.startsWith('language-'));
        language = langClass ? langClass.replace('language-', '') : '';
        
        // Get first ~100 chars of the code as a snippet
        const fullCode = code.textContent || '';
        codeSnippet = fullCode.trim().slice(0, 100);
        if (fullCode.length > 100) codeSnippet += '...';
      }

      this.track('Code Copy', {
        language: language || 'unknown',
        codeLength: code?.textContent?.length || 0,
        codeSnippet,
      });
    }, true);
  }

  // Unified track(): buffers pre-consent, delegates post-consent.
  // Use this instead of trackEvent() for all internal handler calls
  // so buffering works correctly before onetrust.js calls initAmplitude().
  track(eventName, props = {}) {
    if (this._disabled) return;
    if (!this.isInit) {
      this._buffer.push({name: eventName, props});
      return;
    }
    this.trackEvent(eventName, props);
  }
}

export const docsAnalytics = new DocsAnalytics();

if (typeof window !== 'undefined') {
  window.docsAnalytics = docsAnalytics;
}
