/* eslint-disable @cspell/spellchecker */

import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit/static-html.js';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const mockSearchApi = new MockSearchApi();

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-did-you-mean',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  title: 'Search/Did You Mean',
  id: 'atomic-did-you-mean',
  component: 'atomic-did-you-mean',
  render: (args) => html`
  <div style="display: flex; justify-content: flex-start;">
    ${template(args)}
  </div>`,
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {handlers: [...mockSearchApi.handlers]},
  },
  args,
  argTypes,
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.clear();
  },
  play,
};

export default meta;

export const WithAutomaticQueryCorrection: Story = {
  name: 'With automatic query correction',
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mockOnce((response) => ({
      ...response,
      queryCorrection: {
        correctedQuery: 'coveo',
        originalQuery: 'coveoo',
        corrections: [],
      },
    }));
  },
};

export const WithoutAutomaticQueryCorrection: Story = {
  name: 'Without automatic query correction',
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mockOnce((response) => ({
      ...response,
      queryCorrection: {
        corrections: [
          {
            correctedQuery: 'coveo',
            wordCorrections: [
              {
                offset: 0,
                length: 5,
                originalWord: 'ceveo',
                correctedWord: 'coveo',
              },
            ],
          },
        ],
      },
    }));
  },
};
