import {cpSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
// following docs https://typedoc.org/guides/development/#plugins
// eslint-disable-next-line n/no-unpublished-import
import {type Application, Converter, JSX, RendererEvent} from 'typedoc';
import {formatTypeDocToolbar} from './formatTypeDocToolbar.js';
import {insertAtomicSearchBox} from './insertAtomicSearchBox.js';
import {insertBetaNote} from './insertBetaNote.js';
import {insertCustomComments} from './insertCustomComments.js';
import {insertMetaTags} from './insertMetaTags.js';
import {insertSiteHeaderBar} from './insertSiteHeaderBar.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Called by TypeDoc when loaded as a plugin.
 */
export function load(app: Application) {
  // Need the Meta Tags to be inserted first, or it causes issues with the navigation sidebar
  app.renderer.hooks.on('head.begin', () => (
    <>
      <script>
        <JSX.Raw html={`(${insertMetaTags.toString()})();`} />
      </script>
    </>
  ));

  app.renderer.hooks.on('head.end', (event) => (
    <>
      <script>
        <JSX.Raw html={`(${insertBetaNote.toString()})();`} />
      </script>
      <script
        type="module"
        src="https://static.cloud.coveo.com/atomic/v3/atomic.esm.js"
      ></script>
      <script>
        <JSX.Raw
          html={`
          (function() {
            const isLocalHost =
              window.location.hostname === 'localhost' ||
              window.location.hostname === '127.0.0.1';
            const domainScript = isLocalHost
              ? '189eb9e6-31f9-412d-981f-f16eb5581a81-test'
              : '189eb9e6-31f9-412d-981f-f16eb5581a81';

            const script = document.createElement('script');
            script.src = 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js?1';
            script.type = 'text/javascript';
            script.setAttribute('data-document-language', 'true');
            script.setAttribute('data-domain-script', domainScript);
            document.head.appendChild(script);
          })();
        `}
        />
      </script>
      <script
        type="module"
        src={event.relativeURL('assets/vars/onetrust.js')}
      ></script>
      <script>
        <JSX.Raw html={`(${formatTypeDocToolbar.toString()})();`} />
      </script>
      <script>
        <JSX.Raw
          html={`(${insertSiteHeaderBar.toString()})('${event.relativeURL('assets')}');`}
        />
      </script>
      <script>
        <JSX.Raw html={`(${insertAtomicSearchBox.toString()})();`} />
      </script>
      <script
        type="text/javascript"
        src={event.relativeURL('assets/vars/OptanonWrapper.js')}
      ></script>
    </>
  ));

  // data-domain-script here needs to change based on environment: needs "test" removed for prod
  app.renderer.hooks.on('footer.end', (event) => (
    <>
      <link
        rel="stylesheet"
        href={event.relativeURL('assets/css/main-new.css')}
      />
      <script
        type="module"
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
      ></script>
      <link
        rel="stylesheet"
        href={event.relativeURL('assets/css/docs-style.css')}
      />
      <link
        rel="stylesheet"
        href="https://static.cloud.coveo.com/atomic/v3/themes/coveo.css"
      />
      <link
        rel="stylesheet"
        href={event.relativeURL('assets/css/light-theme.css')}
        media="(prefers-color-scheme: light)"
      />
      <link
        rel="stylesheet"
        href={event.relativeURL('assets/css/dark-theme.css')}
        media="(prefers-color-scheme: dark)"
      />
      <script
        type="module"
        src={event.relativeURL('assets/vars/dark-mode-toggle.js')}
      ></script>
      <script
        type="module"
        src={event.relativeURL('assets/vars/dark-mode.js')}
      ></script>
    </>
  ));

  const baseAssetsPath = '../../documentation/assets';

  const createFileCopyEntry = (sourcePath: string) => ({
    from: resolve(__dirname, `${baseAssetsPath}/${sourcePath}`),
    to: resolve(app.options.getValue('out'), `assets/${sourcePath}`),
  });

  const onRenderEnd = () => {
    const filesToCopy = [
      'css/docs-style.css',
      'css/main-new.css',
      'css/light-theme.css',
      'css/dark-theme.css',
      'favicon.ico',
      'icons/coveo-docs-logo.svg',
      'icons/more.svg',
      'icons/external-action-4.svg',
      'icons/external-action-6.svg',
      'icons/moon-and-stars.svg',
      'icons/sun.svg',
      'vars/dark-mode-toggle.js',
      'vars/OptanonWrapper.js',
      'vars/onetrust.js',
    ];

    filesToCopy.forEach((filePath) => {
      const file = createFileCopyEntry(filePath);
      cpSync(file.from, file.to);
    });

    const darkModeJs = {
      from: resolve(__dirname, '../../documentation/dist/dark-mode.js'),
      to: resolve(app.options.getValue('out'), 'assets/vars/dark-mode.js'),
    };

    cpSync(darkModeJs.from, darkModeJs.to);
  };

  app.renderer.on(RendererEvent.END, onRenderEnd);

  app.converter.on(Converter.EVENT_CREATE_DECLARATION, insertCustomComments);
}
