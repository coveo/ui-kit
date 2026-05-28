/* eslint-disable @cspell/spellchecker */

import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit/static-html.js';
import {within} from 'shadow-dom-testing-library';
import {testStatusMessageA11y} from '@/storybook-utils/a11y/status-message.js';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {buildSearchResponseWithResults} from '@/storybook-utils/api/search/search-response-mocks';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-did-you-mean/atomic-did-you-mean.js';
import '@/src/components/search/atomic-query-summary/atomic-query-summary.js';

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
  render: (args) =>
    html` <div style="display: flex; justify-content: flex-start;">
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

export const A11yStatusMessage: Story = {
  name: 'A11y Status Message',
  tags: ['a11y', 'test'],
  args: {
    'automatically-correct-query': false,
  },
  decorators: [
    (story) => html`<atomic-query-summary></atomic-query-summary>${story()}`,
  ],
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
    mockSearchApi.searchEndpoint.mockOnce(buildSearchResponseWithResults(84));
  },
  play: async (context) => {
    await play(context);
    await testStatusMessageA11y(context, {
      triggerAction: async () => {
        const canvas = within(context.canvasElement);
        const correction = await canvas.findByShadowRole('button', {
          name: /coveo/i,
        });
        correction.click();
      },
      expectedText: 'Results loaded. Results 1-10 of 84',
      timeout: 5000,
    });
  },
};
