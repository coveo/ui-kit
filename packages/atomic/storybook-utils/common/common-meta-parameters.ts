import type {Parameters, StoryContext} from '@storybook/web-components-vite';

const formatCode = async (code: string) => {
  const prettier = await import('prettier/standalone');
  const prettierPluginHtml = await import('prettier/plugins/html');
  const prettierPluginEstree = await import('prettier/plugins/estree');
  const prettierPluginPostCSS = await import('prettier/plugins/postcss');

  return prettier.format(code, {
    parser: 'html',
    plugins: [
      prettierPluginHtml.default,
      prettierPluginEstree.default,
      prettierPluginPostCSS.default,
    ],
  });
};

export const parameters: Parameters = {
  layout: 'centered',
  controls: {expanded: true, hideNoControlsWarning: true},
  docs: {
    codePanel: {
      enabled: true,
    },
    source: {
      transform: (code: string, context: StoryContext) => {
        if (context.viewMode === 'docs') {
          return formatCode(code);
        } else {
          const frag = document.createElement('div');
          frag.innerHTML = code;

          let codeRoot = frag.querySelector('#code-root');
          if (!codeRoot) {
            const templates = frag.querySelectorAll('template');
            for (const template of templates) {
              codeRoot = template.content.querySelector('#code-root');
              if (codeRoot) {
                break;
              }
            }
          }
          if (!codeRoot) {
            codeRoot = frag;
          }
          // Get the inner HTML of the code root, replace boolean attributes with an empty string value by the attribute name alone.
          // If code-root is not found, default back to the docs behavior.
          return formatCode(
            codeRoot.innerHTML
              .replaceAll(/(?<=<[^<>]*)=""(?=[^<>]*>)/gm, '')
              .trim()
          );
        }
      },
    },
    story: {autoplay: true},
  },
};
