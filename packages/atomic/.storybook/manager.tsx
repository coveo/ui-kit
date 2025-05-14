import {STORY_MISSING, STORY_RENDERED} from '@storybook/core-events';
import {addons} from '@storybook/manager-api';

addons.register('SELECT-FIRST-STORY-BY-DEFAULT-ONCE', (api) => {
  api.once(STORY_MISSING, () => {
    const currentId = api.getUrlState().storyId;
    if (!currentId) {
      return api.selectFirstStory();
    }
    // The first parameter expects the PascalCase story ID whereas the second expects the sluggified one.
    // See: https://github.com/storybookjs/storybook/blob/b0052ad9f71f5763dcb25af31bc8832097682d29/code/lib/manager-api/src/modules/stories.ts#L401
    api.selectStory(undefined, 'default');
  });
});

const observeAndExpandButtons = () => {
  const observer = new MutationObserver(() => {
    const buttonsToExpand = document.querySelectorAll(
      'button[data-action="expand-all"][data-expanded="false"]'
    );
    if (buttonsToExpand.length > 0) {
      buttonsToExpand.forEach((button) =>
        (button as HTMLButtonElement).click()
      );
      observer.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

const addNoIndexMetaTag = () => {
  if (!document.querySelector('meta[name="robots"][content="noindex"]')) {
    const metaTag = document.createElement('meta');
    metaTag.name = 'robots';
    metaTag.content = 'noindex';
    document.head.appendChild(metaTag);
  }
};

addons.register('expand-all-folders-on-intro', () => {
  addons.getChannel().on(STORY_RENDERED, (storyId) => {
    if (storyId === 'introduction--crawling') {
      observeAndExpandButtons();
      addNoIndexMetaTag();
    }
    if (storyId === 'introduction--default') {
      addNoIndexMetaTag();
    }
  });
});
