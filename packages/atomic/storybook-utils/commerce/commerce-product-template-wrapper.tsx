import { Decorator } from '@storybook/web-components-vite';
import { html, TemplateResult, render } from 'lit';

export const wrapInProductTemplate = (includeCodeRoot: boolean = true): {
  decorator: Decorator;
} => {
  const decorator: Decorator = (story) => {
    const templateTag = document.createElement('template');
    const tempContainer = document.createElement('div');

    const storyResult = story();

    if (
      storyResult &&
      typeof storyResult === 'object' &&
      '_$litType$' in storyResult
    ) {
      render(storyResult as TemplateResult, tempContainer);
      templateTag.innerHTML = tempContainer.innerHTML;
    } else {
      templateTag.innerHTML = String(storyResult);
    }

    if (includeCodeRoot) { templateTag.id = 'code-root'; }
    return html`
      <atomic-product-template>${templateTag}</atomic-product-template>
    `;
  };

  return {
    decorator,
  };
};
