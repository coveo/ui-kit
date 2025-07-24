import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-aria-live',
  title: 'Common/atomic-aria-live',
  id: 'atomic-aria-live',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {};

export const WithRegions: Story = {
  name: 'With Active Regions',
  play: async (context) => {
    await play(context);

    // Simulate adding some regions for demonstration
    const ariaLive = document.querySelector(
      'atomic-aria-live'
    ) as HTMLElement & {
      registerRegion: (region: string, assertive: boolean) => void;
      updateMessage: (
        region: string,
        message: string,
        assertive: boolean
      ) => void;
    };
    if (ariaLive) {
      ariaLive.registerRegion('results', false);
      ariaLive.registerRegion('error', true);
      ariaLive.updateMessage('results', 'Search results updated', false);
    }
  },
};
