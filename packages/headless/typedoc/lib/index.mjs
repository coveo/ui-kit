import {cpSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {JSX, RendererEvent, ParameterType} from 'typedoc';
import {getThemeCSSProperties} from './theme.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
/**
 * Called by TypeDoc when loaded as a plugin.
 */
export function load(app) {
  app.options.addDeclaration({
    name: 'themeColor',
    help: 'Material Theme: Material 3 source color to derive the theme from.',
    type: ParameterType.String,
    defaultValue: '#cb9820',
  });
  app.renderer.hooks.on('head.end', (event) =>
    JSX.createElement(
      JSX.Fragment,
      null,
      JSX.createElement(
        'style',
        null,
        JSX.createElement(JSX.Raw, {
          html: getThemeCSSProperties(app.options.getValue('themeColor')),
        })
      ),
      JSX.createElement('link', {
        rel: 'stylesheet',
        href: event.relativeURL('assets/material-style.css'),
      })
    )
  );
  app.renderer.hooks.on('body.end', () =>
    JSX.createElement(
      'script',
      null,
      JSX.createElement(JSX.Raw, {
        html: /* js */ `
          try {
            const generateLinkElement = document.querySelector(".tsd-generator a");
            const link = document.createElement("a");
            Object.assign(link, {
              href: "https://github.com/dmnsgn/typedoc-material-theme",
              target: "_blank",
              innerText: "typedoc-material-theme."
            });
            generateLinkElement.insertAdjacentElement("afterend", link);
            generateLinkElement.insertAdjacentText("afterend", " with ");
          } catch (error) {

          }
        `,
      })
    )
  );
  const onRenderEnd = () => {
    const from = resolve(__dirname, '../assets/style.css');
    const to = resolve(
      app.options.getValue('out'),
      'assets/material-style.css'
    );
    cpSync(from, to);
  };
  // Support for 0.25.x
  // @ts-expect-error: blah
  if (typeof app.listenTo === 'function') {
    // @ts-expect-error: blah
    app.listenTo(app.renderer, RendererEvent.END, onRenderEnd);
  } else {
    app.renderer.on(RendererEvent.END, onRenderEnd);
  }
}
