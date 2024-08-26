import {cpSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
// eslint-disable-next-line n/no-extraneous-import
import {Application, JSX, RendererEvent} from 'typedoc';
import {insertLinkAndSearchBox} from './scripts.js';

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
        href="https://static.cloud.coveo.com/atomic/v2/themes/coveo.css"
      />
    </>
  ));

  app.renderer.hooks.on('body.end', () => (
    <>
      <script
        type="module"
        src="https://static.cloud.coveo.com/atomic/v2/atomic.esm.js"
      ></script>
      <script>
        <JSX.Raw html={`(${insertLinkAndSearchBox.toString()})();`} />
      </script>
    </>
  ));

  const onRenderEnd = () => {
    const from = resolve(__dirname, '../assets/style.css');
    const to = resolve(app.options.getValue('out'), 'assets/docs-style.css');
    cpSync(from, to);
  };

  // @ts-expect-error: Support for 0.25.x
  if (typeof app.listenTo === 'function') {
    // @ts-expect-error: Support for 0.25.x
    app.listenTo(app.renderer, RendererEvent.END, onRenderEnd);
  } else {
    app.renderer.on(RendererEvent.END, onRenderEnd);
  }
}
