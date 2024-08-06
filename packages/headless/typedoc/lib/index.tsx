import {cpSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Application, JSX, RendererEvent, ParameterType} from 'typedoc';
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
    </>
  ));

  app.renderer.hooks.on('body.end', () => (
    <script>
      <JSX.Raw
        html={
          /* js */ `
          try {
            const generateLinkElement = document.querySelector(".tsd-generator a");
            const link = document.createElement("a");
            Object.assign(link, {
              href: "https://github.com/dmnsgn/typedoc-material-theme",
              target: "_blank",
              rel: "noreferrer",
              innerText: "typedoc-material-theme."
            });
            generateLinkElement.insertAdjacentElement("afterend", link);
            generateLinkElement.insertAdjacentText("afterend", " with ");
          } catch (error) {
          }
        `
        }
      />
    </script>
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
  // @ts-ignore
  if (typeof app.listenTo === 'function') {
    // @ts-ignore
    app.listenTo(app.renderer, RendererEvent.END, onRenderEnd);
  } else {
    app.renderer.on(RendererEvent.END, onRenderEnd);
  }
}
