import {cpSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
// following docs https://typedoc.org/guides/development/#plugins
// eslint-disable-next-line n/no-unpublished-import
import {Application, JSX, RendererEvent, Converter} from 'typedoc';
import {insertAtomicSearchBox} from './insertAtomicSearchBox.js';
import {insertCoveoLogo} from './insertCoveoLogo.js';
import {insertCustomComments} from './insertCustomComments.js';
import {insertSurveyLink} from './insertSurveyLink.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Called by TypeDoc when loaded as a plugin.
 */
export function load(app: Application) {
  app.renderer.hooks.on('head.end', (event) => (
    <>
      <link
        rel="stylesheet"
        href={event.relativeURL('assets/docs-style.css')}
      />
      <link
        rel="stylesheet"
        href="https://static.cloud.coveo.com/atomic/v3/themes/coveo.css"
      />
      <script
        type="module"
        src="https://static.cloud.coveo.com/atomic/v3/atomic.esm.js"
      ></script>
      <script>
        <JSX.Raw html={`(${insertAtomicSearchBox.toString()})();`} />
      </script>
      <script>
        <JSX.Raw html={`(${insertSurveyLink.toString()})();`} />
      </script>
      <script>
        <JSX.Raw
          html={`(${insertCoveoLogo.toString()})('${event.relativeURL('assets/coveo-docs-logo.svg')}');`}
        />
      </script>
    </>
  ));

  const onRenderEnd = () => {
    const filesToCopy = [
      {
        from: resolve(__dirname, '../assets/docs-style.css'),
        to: resolve(app.options.getValue('out'), 'assets/docs-style.css'),
      },
      {
        from: resolve(__dirname, '../assets/coveo-docs-logo.svg'),
        to: resolve(app.options.getValue('out'), 'assets/coveo-docs-logo.svg'),
      },
    ];

    filesToCopy.forEach((file) => {
      cpSync(file.from, file.to);
    });
  };

  app.renderer.on(RendererEvent.END, onRenderEnd);

  app.converter.on(Converter.EVENT_CREATE_DECLARATION, insertCustomComments);
}
