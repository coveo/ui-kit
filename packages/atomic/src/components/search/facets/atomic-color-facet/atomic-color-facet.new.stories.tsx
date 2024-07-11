import {parameters} from '@coveo/atomic/storybookUtils/common-meta-parameters';
import {facetDecorator} from '@coveo/atomic/storybookUtils/facets-decorator';
import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import {wrapInSearchInterface} from '@coveo/atomic/storybookUtils/search-interface-wrapper';
import {
  ArgTypes,
  Args,
  type Meta,
  type StoryObj as Story,
} from '@storybook/web-components';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-color-facet',
  title: 'Atomic/ColorFacet',
  id: 'atomic-color-facet',

  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

const facetValueToCss = {
  doc: {
    'background-image': 'url("atomic/assets/document.svg")',
    'background-color': 'rgb(146,151,196)',
  },
  lithiumuser: {
    'background-image': 'url("atomic/assets/folder.svg',
    'background-color': 'rgb(132, 199, 208)',
  },
  SalesforceItem: {
    'background-image': 'url("atomic/assets/record.svg',
    'background-color': 'rgb(146, 151, 196)',
  },
  lithiummessage: {
    'background-image': 'url("atomic/assets/knowledge.svg',
    'background-color': 'rgb(147, 104, 183)',
  },
  ppt: {
    'background-image': 'url("atomic/assets/ppt.svg',
    'background-color': 'rgb(170, 62, 152)',
  },
  pdf: {
    'background-image': 'url("atomic/assets/pdf.svg',
    'background-color': 'transparent',
  },
  'rss-item': {
    'background-image': 'url("atomic/assets/rssitem.svg',
    'background-color': 'transparent',
  },
  video: {
    'background-image': 'url("atomic/assets/video.svg',
    'background-color': 'rgb(122, 231, 199)',
  },
};

const argTypes = Object.keys(facetValueToCss).reduce<ArgTypes>(
  (acc, facetValue) =>
    Object.assign(acc, {
      [`cssParts-value-${facetValue}`]: {
        control: {
          type: 'object',
        },
        if: {arg: 'field', eq: 'filetype'},
        name: `value-${facetValue}`,
        required: false,
        description: `The facet value to customize facet value '${facetValue}'. See \`value-*\`.`,
        type: {
          name: 'object',
          value: {},
        },
        table: {
          category: 'css shadow parts',
          subcategory: 'Dynamic parts',
          type: {},
          defaultValue: {},
        },
      },
    }),
  {} as ArgTypes
);

const baseFacetValueCss = {
  'background-position': 'center',
  'background-size': 'contain',
  'background-repeat': 'no-repeat',
};

const args = Object.entries(facetValueToCss).reduce<Args>(
  (acc, [facetValue, css]) =>
    Object.assign(acc, {
      [`cssParts-value-${facetValue}`]: {
        ...baseFacetValueCss,
        ...css,
      },
    }),
  {} as Args
);

export const Default: Story = {
  name: 'atomic-color-facet',
  argTypes: {
    ...argTypes,
    'cssParts-value-*': {
      name: 'value-*',
      control: false,
    },
  },
  args: {
    ...args,
    'attributes-field': 'filetype',
    'attributes-number-of-values': 9,
  },
  decorators: [facetDecorator],
};

export const LowFacetValues: Story = {
  tags: ['test'],
  args: {
    'attributes-field': 'objecttype',
    'attributes-number-of-values': 2,
  },
  decorators: [facetDecorator],
};
