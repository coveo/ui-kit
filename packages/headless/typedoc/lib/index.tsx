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
        <JSX.Raw
          html={
            /* js */ `
              document.addEventListener('DOMContentLoaded', function () {
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

                // Insert Atomic search box in the header
                const header = document.querySelector('.tsd-page-toolbar .tsd-toolbar-contents');
                if (header) {
                  const searchInterface = document.createElement('atomic-search-interface');
                  const searchBox = document.createElement('atomic-search-box');
                  searchBox.setAttribute('redirection-url', 'https://docs.coveo.com/en/search');

                  searchInterface.appendChild(searchBox);
                  header.insertBefore(searchInterface, header.firstChild);

                  // Initialize the search interface with necessary configurations
                  (async () => {
                    await customElements.whenDefined('atomic-search-interface');
                    const searchInterfaceElement = document.querySelector('atomic-search-interface');

                    await searchInterfaceElement.initialize({
                      organizationId: 'coveosearch',
                      organizationEndpoints: await searchInterfaceElement.getOrganizationEndpoints('coveosearch'),
                      accessToken: 'xx6ac9d08f-eb9a-48d5-9240-d7c251470c93'
                    });
                  })();
                }
              });
            `
          }
        />
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
  // @ts-ignore
  if (typeof app.listenTo === 'function') {
    // @ts-ignore
    app.listenTo(app.renderer, RendererEvent.END, onRenderEnd);
  } else {
    app.renderer.on(RendererEvent.END, onRenderEnd);
  }
}
