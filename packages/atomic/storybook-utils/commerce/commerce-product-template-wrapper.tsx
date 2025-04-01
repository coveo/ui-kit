import {Decorator} from '@storybook/web-components';
import {html, TemplateResult} from 'lit';

export const wrapInProductTemplate = (): {
  decorator: Decorator;
} => {
  const decorator: Decorator = (story) => {
    // lit does not support adding expressions to `template` tags
    // https://lit.dev/docs/templates/expressions/#invalid-locations

    const templateTag = document.createElement('template');
    templateTag.innerHTML = `${(story() as TemplateResult).strings.join('')}`;
    templateTag.id = 'code-root';
    return html`
      <atomic-product-template>${templateTag}</atomic-product-template>
    `;
  };

  return {
    decorator,
  };
};
