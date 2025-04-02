import {STORY_MISSING} from '@storybook/core-events';
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
