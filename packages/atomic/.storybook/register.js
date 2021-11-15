import React from 'react';
import {addons, types} from '@storybook/addons';
import {AddonPanel} from '@storybook/components';
import {ShadowPartPanel} from './shadow-parts-addon/shadow-parts-panel';
import {CodeSamplePanel} from './code-sample-addon/code-sample-panel';

const ADDON_ID_SHADOW_PARTS = 'shadow_parts';
const PANEL_ID_SHADOW_PARTS = `${ADDON_ID_SHADOW_PARTS}/panel`;
const ADDON_ID_CODE_SAMPLE = 'code_sample';
const PANEL_ID_CODE_SAMPLE = `${ADDON_ID_CODE_SAMPLE}/panel`;

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
