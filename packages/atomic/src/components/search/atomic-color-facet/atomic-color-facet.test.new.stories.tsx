import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {facetDecorator} from '@/storybook-utils/common/facets-decorator';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const selectedValueHarness = new MockSearchApi();
selectedValueHarness.searchEndpoint.mock((response) => {
  if ('facets' in response) {
    return {
      ...response,
      facets: [
        ...(response.facets || []),
        {
          facetId: 'filetype',
          field: 'filetype',
          moreValuesAvailable: true,
          values: [
            {value: 'Email', state: 'selected', numberOfResults: 87},
            {value: 'HTML', state: 'idle', numberOfResults: 245},
            {value: 'Message', state: 'idle', numberOfResults: 134},
            {value: 'PDF', state: 'idle', numberOfResults: 43},
            {value: 'Powerpoint', state: 'idle', numberOfResults: 76},
            {value: 'Text', state: 'idle', numberOfResults: 54},
            {value: 'Thread', state: 'idle', numberOfResults: 98},
            {value: 'Video', state: 'idle', numberOfResults: 156},
          ],
          label: 'File Type',
        },
      ],
    };
  }
  return response;
});

const {decorator, play} = wrapInSearchInterface();

const colorFacetStylesDecorator = (story: () => unknown) => {
  return html`
    <style>
      atomic-color-facet::part(value-Email) {
        background-color: rgb(100, 149, 237);
      }
    </style>
    ${story()}
  `;
};

const meta: Meta = {
  component: 'atomic-color-facet',
  title: 'Search/Facet (Color)/Test Stories',
  tags: ['test'],
  parameters: {
    ...parameters,
    msw: {handlers: [...selectedValueHarness.handlers]},
  },
  decorators: [decorator, facetDecorator, colorFacetStylesDecorator],
  play,
};

export default meta;

export const WithSelectedValue: Story = {
  name: 'With Selected Value',
  args: {
    field: 'filetype',
  },
};
