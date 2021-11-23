import React from 'react';
import {addons, types} from '@storybook/addons';
import {AddonPanel} from '@storybook/components';
import {ShadowPartPanel} from './shadow-parts-addon/shadow-parts-panel';
import {CodeSamplePanel} from './code-sample-addon/code-sample-panel';
import {debounce} from 'lodash';

const ADDON_ID_SHADOW_PARTS = 'shadow_parts';
const PANEL_ID_SHADOW_PARTS = `${ADDON_ID_SHADOW_PARTS}/panel`;
const ADDON_ID_CODE_SAMPLE = 'code_sample';
const PANEL_ID_CODE_SAMPLE = `${ADDON_ID_CODE_SAMPLE}/panel`;
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

addons.register('CODE_SAMPLE', () => {
  addons.add(PANEL_ID_CODE_SAMPLE, {
    type: types.PANEL,
    title: 'Code Sample',
    render: ({active, key}) => (
      <AddonPanel active={active} key={key}>
        <CodeSamplePanel />
      </AddonPanel>
    ),
  });
});

addons.register('A11Y_EXTENSION', (api) => {
  const rerunAccessibilityTest = debounce(
    () => {
      api.emit('storybook/a11y/manual', api.getCurrentStoryData().id);
    },
    500,
    {leading: false, trailing: true}
  );
  api.on(A11Y_EXTENSION_EVENTS.SEARCH_EXECUTED, rerunAccessibilityTest);
});
