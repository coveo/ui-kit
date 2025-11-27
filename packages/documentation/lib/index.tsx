import {cpSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  type Application,
  Converter,
  type DefaultTheme,
  type DocumentReflection,
  JSX,
  KindRouter,
  type Models,
  type NavigationElement,
  ParameterType,
  type ProjectReflection,
  RendererEvent,
} from 'typedoc';
import {formatTypeDocToolbar} from './formatTypeDocToolbar.js';
import {hoistOtherCategoryInArray, hoistOtherCategoryInNav} from './hoist.js';
import {insertAtomicSearchBox} from './insertAtomicSearchBox.js';
import {insertBetaNote} from './insertBetaNote.js';
import {insertCustomComments} from './insertCustomComments.js';
import {insertMetaTags} from './insertMetaTags.js';
import {insertSiteHeaderBar} from './insertSiteHeaderBar.js';
import {applyTopLevelRenameArray} from './renaming.js';
import {
  applyNestedOrderingArray,
  applyNestedOrderingNode,
  applyTopLevelOrderingArray,
  applyTopLevelOrderingNode,
} from './sortNodes.js';
import type {TFrontMatter, TNavNode} from './types.js';

class KebabRouter extends KindRouter {
  // Optional: keep .html (default) or change if you want
  extension = '.html';

  protected getIdealBaseName(refl: Models.Reflection): string {
    if (!(refl as DocumentReflection)?.frontmatter?.slug)
      return super.getIdealBaseName(refl);
    const {slug} = (refl as DocumentReflection).frontmatter as TFrontMatter;

    return `documents/${slug}`;
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Called by TypeDoc when loaded as a plugin.
 */
export const load = (app: Application) => {
  app.options.addDeclaration({
    name: 'hoistOther.fallbackCategory',
    help: "Name of the fallback category to hoist (defaults to defaultCategory or 'Other').",
    type: ParameterType.String,
  });

  app.options.addDeclaration({
    name: 'hoistOther.topLevelGroup',
    help: "Name of the top-level group whose children should be promoted to root (default 'Documents').",
    type: ParameterType.String,
  });

  app.options.addDeclaration({
    name: 'hoistOther.topLevelOrder',
    help: 'An array to sort the top level nav by.',
    type: ParameterType.Array,
  });

  app.options.addDeclaration({
    name: 'hoistOther.nestedOrder',
    help: "Object mapping parent title -> ordering array for its children. Use '*' for a default. If omitted, children are sorted alphabetically.",
    type: ParameterType.Mixed,
  });

  app.options.addDeclaration({
    name: 'hoistOther.renameModulesTo',
    help: "If set, rename any top-level group titled 'Modules' to this string.",
    type: ParameterType.String,
  });

  const originalMethodName = 'getNavigation';
  let originalMethod: (
    project: ProjectReflection
  ) => NavigationElement[] | null = null;
  app.renderer.on('beginRender', () => {
    const theme = app.renderer.theme as DefaultTheme | undefined;
    if (!theme) return;

    originalMethod = theme.getNavigation;

    if (!originalMethod) return;

    const opts = app.options;
    const fallback =
      (opts.getValue('hoistOther.fallbackCategory') as string) ||
      (opts.getValue('defaultCategory') as string) ||
      'Other';

    const topLevelGroup =
      (opts.getValue('hoistOther.topLevelGroup') as string) || 'Documents';

    const topLevelOrder =
      (opts.getValue('hoistOther.topLevelOrder') as string[] | undefined) ||
      undefined;

    let nestedOrder = opts.getValue('hoistOther.nestedOrder') as
      | Record<string, string[]>
      | string
      | undefined;
    if (typeof nestedOrder === 'string') {
      try {
        nestedOrder = JSON.parse(nestedOrder);
      } catch {}
    }

    const renameModulesTo =
      (opts.getValue('hoistOther.renameModulesTo') as string | undefined) ||
      undefined;

    const typedNestedOrder = nestedOrder as Record<string, string[]>;

    theme.getNavigation = function wrappedNavigation(
      this: unknown,
      ...args: unknown[]
    ) {
      const nav = originalMethod!.apply(this, args);

      // The nav shape can be an array of nodes or a single root with children
      if (Array.isArray(nav)) {
        if (renameModulesTo?.trim()) {
          applyTopLevelRenameArray(nav, 'Modules', renameModulesTo.trim());
        }

        hoistOtherCategoryInArray(nav as TNavNode[], fallback, topLevelGroup);

        if (topLevelOrder?.length) {
          applyTopLevelOrderingArray(nav as TNavNode[], topLevelOrder);
        }

        applyNestedOrderingArray(nav as TNavNode[], typedNestedOrder);
      } else if (nav && typeof nav === 'object') {
        if (renameModulesTo?.trim() && Array.isArray(nav.children)) {
          applyTopLevelRenameArray(
            nav.children,
            'Modules',
            renameModulesTo.trim()
          );
        }

        hoistOtherCategoryInNav(nav as TNavNode, fallback);
        if (
          (nav as TNavNode).children &&
          topLevelOrder &&
          topLevelOrder.length
        ) {
          applyTopLevelOrderingNode(nav as TNavNode, topLevelOrder);
        }
        applyNestedOrderingNode(nav as TNavNode, typedNestedOrder);
      }
      return nav;
    };
  });

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

  app.renderer.on(RendererEvent.END, () => {
    const baseAssetsPath = '../../documentation/assets';
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
      const file = {
        from: resolve(__dirname, `${baseAssetsPath}/${filePath}`),
        to: resolve(app.options.getValue('out'), `assets/${filePath}`),
      };
      cpSync(file.from, file.to);
    });

    const darkModeJs = {
      from: resolve(__dirname, '../../documentation/dist/dark-mode.js'),
      to: resolve(app.options.getValue('out'), 'assets/vars/dark-mode.js'),
    };
    // Restore original to avoid side effects
    const theme = app.renderer.theme as DefaultTheme | undefined;
    if (theme && originalMethodName && originalMethod) {
      theme[originalMethodName] = originalMethod;
    }
    originalMethod = null;

    cpSync(darkModeJs.from, darkModeJs.to);
  });

  app.renderer.defineRouter('kebab', KebabRouter);

  app.converter.on(Converter.EVENT_CREATE_DECLARATION, insertCustomComments);
};
