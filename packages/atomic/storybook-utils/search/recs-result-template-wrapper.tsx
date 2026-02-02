import {Decorator} from '@storybook/web-components-vite';
import {html, render, type TemplateResult} from 'lit';

export const wrapInRecsResultTemplate = (): {
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

    return html`
      <atomic-recs-list display="list" density="normal" image-size="none">
        <atomic-recs-result-template>${templateTag}</atomic-recs-result-template>
      </atomic-recs-list>
    `;
  };

  return {
    decorator,
  };
};
