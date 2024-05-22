import {AddonPanel} from '@storybook/components';
import {STORY_MISSING} from '@storybook/core-events';
import {addons, types} from '@storybook/manager-api';
// import {debounce} from 'lodash';
import React from 'react';
// import {CodeSamplePanel} from './code-sample-addon/code-sample-panel';
import {ShadowPartPanel} from './shadow-parts-addon/shadow-parts-panel';

const ADDON_ID_SHADOW_PARTS = 'shadow_parts';
const PANEL_ID_SHADOW_PARTS = `${ADDON_ID_SHADOW_PARTS}/panel`;
const ADDON_ID_CODE_SAMPLE = 'code_sample';
// const PANEL_ID_CODE_SAMPLE = `${ADDON_ID_CODE_SAMPLE}/panel`;
export const A11Y_EXTENSION_EVENTS = {
  SEARCH_EXECUTED: 'a11y/extension/search_executed',
};

addons.register('SHADOW_PARTS', () => {
  addons.add(PANEL_ID_SHADOW_PARTS, {
    type: types.PANEL,
    title: 'Shadow Parts',
    render: ({active, key}) => (
      <AddonPanel active={active} key={key}>
        <ShadowPartPanel />
      </AddonPanel>
    ),
  });
});

// addons.register('CODE_SAMPLE', () => {
//   addons.add(PANEL_ID_CODE_SAMPLE, {
//     type: types.PANEL,
//     title: 'Code Sample',
//     render: ({active, key}) => (
//       <AddonPanel active={active} key={key}>
//         <CodeSamplePanel />
//       </AddonPanel>
//     ),
//   });
// });

// addons.register('A11Y_EXTENSION', (api) => {
//   const rerunAccessibilityTest = debounce(
//     () => {
//       api.emit('storybook/a11y/manual', api.getCurrentStoryData().id);
//     },
//     500,
//     {leading: false, trailing: true}
//   );
//   api.on(A11Y_EXTENSION_EVENTS.SEARCH_EXECUTED, rerunAccessibilityTest);
// });

addons.register('SELECT-FIRST-STORY-BY-DEFAULT-ONCE', (api) => {
  api.once(STORY_MISSING, () => {
    const currentId = api.getUrlState().storyId;
    if (!currentId) {
      return api.selectFirstStory();
    }
    // The first parameter expects the PascalCase story ID whereas the second expects the sluggified one.
    // See: https://github.com/storybookjs/storybook/blob/b0052ad9f71f5763dcb25af31bc8832097682d29/code/lib/manager-api/src/modules/stories.ts#L401
    api.selectStory(undefined, "default");
  });
});
