import {cpSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Application, JSX, RendererEvent, ParameterType} from 'typedoc';
import {insertLinkAndSearchBox} from './scripts.js';
import {getThemeCSSProperties} from './theme.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Called by TypeDoc when loaded as a plugin.
 */
export function load(app: Application) {
  app.options.addDeclaration({
    name: 'themeColor',
    help: 'Material Theme: Material 3 source color to derive the theme from.',
    type: ParameterType.String,
    defaultValue: '#cb9820',
  });

  app.renderer.hooks.on('head.end', (event) => (
    <>
      <style>
        <JSX.Raw
          html={getThemeCSSProperties(
            app.options.getValue('themeColor') as string
          )}
        />
      </style>
      <link
        rel="stylesheet"
        href={event.relativeURL('assets/material-style.css')}
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
    const to = resolve(
      app.options.getValue('out'),
      'assets/material-style.css'
    );
    cpSync(from, to);
  };

  // Support for 0.25.x
  // @ts-expect-error
  if (typeof app.listenTo === 'function') {
    // @ts-expect-error
    app.listenTo(app.renderer, RendererEvent.END, onRenderEnd);
  } else {
    app.renderer.on(RendererEvent.END, onRenderEnd);
  }
}
