import {IconButton} from 'storybook/internal/components';
import {STORY_MISSING, STORY_RENDERED} from 'storybook/internal/core-events';
import {CogIcon} from '@storybook/icons';
import {addons, types} from 'storybook/manager-api';
import {themes} from 'storybook/theming';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react';

declare global {
  interface Window {
    OneTrust: {
      ToggleInfoDisplay: () => void;
    };
  }
}

addons.setConfig({
  theme: {
    ...themes.dark,
    brandUrl: '?path=/story/introduction--default',
    brandTarget: '_self',
  },
});

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

addons.register('custom/onetrust-button', () => {
  addons.add('custom/onetrust-button/toolbar', {
    type: types.TOOL,
    title: 'Cookie Preferences',
    match: ({viewMode}) => viewMode === 'story',
    render: () => (
      <IconButton
        key="onetrust-button"
        title="Open Cookie Preferences"
        onClick={() => {
          if (
            window.OneTrust &&
            typeof window.OneTrust.ToggleInfoDisplay === 'function'
          ) {
            window.OneTrust.ToggleInfoDisplay();
          } else {
            console.warn('OneTrust is not available on this page.');
          }
        }}
      >
        <CogIcon />
      </IconButton>
    ),
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
