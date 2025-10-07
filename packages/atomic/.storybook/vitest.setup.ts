import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import {setProjectAnnotations} from '@storybook/web-components-vite';
import {beforeEach, vi} from 'vitest';
import * as projectAnnotations from './preview';

// Complement packages/atomic/vitest-utils/setup.ts by silencing console.warn and console.log as well (Storybook is a bit noisy atm).
beforeEach(async () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

// This is an important step to apply the right configuration when testing your stories.
// More info at: https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations
setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);
