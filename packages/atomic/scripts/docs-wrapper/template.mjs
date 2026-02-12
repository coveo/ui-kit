/**
 * Assembles the final HTML page from pre-built content strings.
 * Pure function — no file I/O.
 *
 * @param {object} options
 * @param {string} options.sidebarHtml   - Rendered sidebar navigation HTML
 * @param {string} options.inlineCss     - CSS to embed in a <style> tag
 * @param {string} options.cookieScripts - OneTrust / cookie consent scripts
 * @param {string} options.clientJs      - Browser-side JS (search init + nav)
 * @param {string} options.defaultStory  - Story ID to load by default
 * @returns {string}  Complete HTML document
 */
export function buildPageHtml({
  sidebarHtml,
  inlineCss,
  cookieScripts,
  clientJs,
  defaultStory,
}) {
  const resolvedClientJs = clientJs.replaceAll(
    '__DEFAULT_STORY__',
    defaultStory
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Coveo Atomic — Component Reference</title>

  <!-- Atomic CDN — for the search box in the header -->
  <script type="module" src="https://static.cloud.coveo.com/atomic/v3/atomic.esm.js"></script>
  <link rel="stylesheet" href="https://static.cloud.coveo.com/atomic/v3/themes/coveo.css">

  <style>${inlineCss}</style>

  <!-- OneTrust cookie consent -->
  ${cookieScripts}
</head>
<body>

  <!-- ═══ Header ═══ -->
  <header class="docs-header">
    <a class="docs-header__logo" href="https://docs.coveo.com/en/0/" target="_blank" rel="noopener">
      <svg width="90" height="24" viewBox="0 0 90 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="18" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="18" font-weight="700" fill="white">coveo</text>
      </svg>
      <span class="docs-header__logo-text">docs</span>
    </a>

    <div class="docs-header__search">
      <atomic-search-interface id="docs-search" search-hub="DocsAtomicStorybook">
        <atomic-search-box redirection-url="https://docs.coveo.com/en/search/"></atomic-search-box>
      </atomic-search-interface>
    </div>

    <nav class="docs-header__nav">
      <a href="https://docs.coveo.com/en/atomic/latest/usage/" target="_blank" rel="noopener">Usage</a>
      <a href="#introduction--docs" class="active">Reference</a>
      <a href="https://docs.coveo.com/en/atomic/latest/change-log/" target="_blank" rel="noopener">Change log</a>
      <a href="storybook-ui/index.html" target="_blank" rel="noopener" title="Open original Storybook UI for addon panels & controls">Storybook UI</a>
    </nav>

    <button class="docs-header__cookie-btn" onclick="window.OneTrust && window.OneTrust.ToggleInfoDisplay()" title="Cookie Preferences">🍪</button>
  </header>

  <!-- ═══ Layout ═══ -->
  <div class="docs-layout">

    <!-- Sidebar -->
    <nav class="docs-sidebar" id="sidebar">
      ${sidebarHtml}
    </nav>

    <!-- Content iframe -->
    <main class="docs-content">
      <iframe id="story-frame" src="iframe.html?id=${defaultStory}&viewMode=docs" title="Component preview"></iframe>
    </main>
  </div>

  <!-- Mobile sidebar toggle -->
  <button class="docs-sidebar-toggle" id="sidebar-toggle" aria-label="Toggle sidebar">☰</button>

  <script type="module">
${resolvedClientJs}
  </script>

</body>
</html>`;
}
