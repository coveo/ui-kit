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
      }),
      JSX.createElement('link', {
        rel: 'stylesheet',
        href: 'https://static.cloud.coveo.com/atomic/v2/themes/coveo.css',
      })
    )
  );

  app.renderer.hooks.on('body.end', () =>
    JSX.createElement(
      JSX.Fragment,
      null,
      JSX.createElement('script', {
        type: 'module',
        src: 'https://static.cloud.coveo.com/atomic/v2/atomic.esm.js',
      }),
      JSX.createElement(
        'script',
        null,
        JSX.createElement(JSX.Raw, {
          html: `
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
                console.error("Error adding typedoc link: ", error);
              }

              // Move TypeDoc search box to the top of the left panel
              const tsdSearch = document.getElementById('tsd-search');
              const typeDocSearchBox = tsdSearch ? tsdSearch.cloneNode(true) : null;
              if (typeDocSearchBox) {
                const colSidebar = document.querySelector('.col-sidebar');
                if (colSidebar) {
                  colSidebar.insertAdjacentElement('afterbegin', typeDocSearchBox);
                }
              }

              // Insert Atomic search box in place of TypeDoc search box
              if (tsdSearch) {
                tsdSearch.innerHTML = ''; // Clear existing contents

                const searchInterface = document.createElement('atomic-search-interface');
                const searchBox = document.createElement('atomic-search-box');
                searchBox.setAttribute('redirection-url', 'https://docs.coveo.com/en/search');

                searchInterface.appendChild(searchBox);
                tsdSearch.appendChild(searchInterface);

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

              // Ensure the TypeDoc search box is re-initialized if necessary
              function initTypeDocSearch() {
                const searchInput = document.getElementById('tsd-search-field');
                const searchResults = document.querySelector("#tsd-search .results");
                if (searchInput && searchResults) {
                  searchInput.addEventListener('input', () => {
                    if (window.search) {
                      window.search.updateResults();
                    }
                  });

                  searchResults.addEventListener('mouseup', () => {
                    if (window.search) {
                      window.search.clearResults();
                    }
                  });
                }

                if (window.search) {
                  window.search.init();
                }
              }

              initTypeDocSearch();
            });
          `,
        })
      )
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
