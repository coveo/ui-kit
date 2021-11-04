import React from 'react';
import {addons, types} from '@storybook/addons';
import {AddonPanel} from '@storybook/components';
import {ShadowPartPanel} from './shadow-parts-addon/shadow-parts-panel';

const ADDON_ID = 'shadow_parts';
const PANEL_ID = `${ADDON_ID}/panel`;

addons.register('SHADOW_PARTS', () => {
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: 'Shadow Parts',
    render: ({active, key}) => (
      <AddonPanel active={active} key={key}>
        <ShadowPartPanel />
      </AddonPanel>
    ),
  });
});
