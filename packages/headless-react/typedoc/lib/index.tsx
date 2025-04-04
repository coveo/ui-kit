import {cpSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
// following docs https://typedoc.org/guides/development/#plugins
// eslint-disable-next-line n/no-unpublished-import
import {Application, JSX, RendererEvent, Converter} from 'typedoc';
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
      <script
        src="https://cdn.cookielaw.org/scripttemplates/otSDKStub.js?1"
        data-document-language="true"
        type="text/javascript"
        data-domain-script="189eb9e6-31f9-412d-981f-f16eb5581a81-test"
      ></script>
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
      <link rel="stylesheet" href={event.relativeURL('assets/main-new.css')} />
      <script
        type="module"
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
      ></script>
      <link
        rel="stylesheet"
        href={event.relativeURL('assets/docs-style.css')}
      />
      <link
        rel="stylesheet"
        href="https://static.cloud.coveo.com/atomic/v3/themes/coveo.css"
      />
      <link
        rel="stylesheet"
        href={event.relativeURL('assets/light-theme.css')}
        media="(prefers-color-scheme: light)"
      />
      <link
        rel="stylesheet"
        href={event.relativeURL('assets/dark-theme.css')}
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

  const onRenderEnd = () => {
    const filesToCopy = [
      {
        from: resolve(__dirname, '../assets/docs-style.css'),
        to: resolve(app.options.getValue('out'), 'assets/docs-style.css'),
      },
      {
        from: resolve(__dirname, '../assets/main-new.css'),
        to: resolve(app.options.getValue('out'), 'assets/main-new.css'),
      },
      {
        from: resolve(__dirname, '../assets/light-theme.css'),
        to: resolve(app.options.getValue('out'), 'assets/light-theme.css'),
      },
      {
        from: resolve(__dirname, '../assets/dark-theme.css'),
        to: resolve(app.options.getValue('out'), 'assets/dark-theme.css'),
      },
      {
        from: resolve(__dirname, '../assets/coveo-docs-logo.svg'),
        to: resolve(app.options.getValue('out'), 'assets/coveo-docs-logo.svg'),
      },
      {
        from: resolve(__dirname, '../assets/favicon.ico'),
        to: resolve(app.options.getValue('out'), 'assets/favicon.ico'),
      },
      {
        from: resolve(__dirname, '../assets/icons/header/more.svg'),
        to: resolve(
          app.options.getValue('out'),
          'assets/icons/header/more.svg'
        ),
      },
      {
        from: resolve(
          __dirname,
          '../assets/icons/header/external-action-4.svg'
        ),
        to: resolve(
          app.options.getValue('out'),
          'assets/icons/header/external-action-4.svg'
        ),
      },
      {
        from: resolve(
          __dirname,
          '../assets/icons/header/external-action-6.svg'
        ),
        to: resolve(
          app.options.getValue('out'),
          'assets/icons/header/external-action-6.svg'
        ),
      },
      {
        from: resolve(__dirname, '../assets/icons/header/moon-and-stars.svg'),
        to: resolve(
          app.options.getValue('out'),
          'assets/icons/moon-and-stars.svg'
        ),
      },
      {
        from: resolve(__dirname, '../assets/icons/header/sun.svg'),
        to: resolve(app.options.getValue('out'), 'assets/icons/sun.svg'),
      },
      {
        from: resolve(__dirname, '../assets/vars/dark-mode-toggle.js'),
        to: resolve(
          app.options.getValue('out'),
          'assets/vars/dark-mode-toggle.js'
        ),
      },
      {
        from: resolve(__dirname, './dark-mode.js'),
        to: resolve(app.options.getValue('out'), 'assets/vars/dark-mode.js'),
      },
      {
        from: resolve(__dirname, '../assets/vars/OptanonWrapper.js'),
        to: resolve(
          app.options.getValue('out'),
          'assets/vars/OptanonWrapper.js'
        ),
      },
      {
        from: resolve(__dirname, '../assets/vars/onetrust.js'),
        to: resolve(app.options.getValue('out'), 'assets/vars/onetrust.js'),
      },
    ];

    filesToCopy.forEach((file) => {
      cpSync(file.from, file.to);
    });
  };

  app.renderer.on(RendererEvent.END, onRenderEnd);

  app.converter.on(Converter.EVENT_CREATE_DECLARATION, insertCustomComments);
}
