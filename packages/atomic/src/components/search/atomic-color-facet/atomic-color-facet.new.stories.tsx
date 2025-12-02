import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {facetDecorator} from '@/storybook-utils/common/facets-decorator';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const searchApiHarness = new MockSearchApi();

const baseFacetValues = [
  {value: 'Email', state: 'idle', numberOfResults: 87},
  {value: 'HTML', state: 'idle', numberOfResults: 245},
  {value: 'Message', state: 'idle', numberOfResults: 134},
  {value: 'PDF', state: 'idle', numberOfResults: 43},
  {value: 'Powerpoint', state: 'idle', numberOfResults: 76},
  {value: 'Text', state: 'idle', numberOfResults: 54},
  {value: 'Thread', state: 'idle', numberOfResults: 98},
  {value: 'Video', state: 'idle', numberOfResults: 156},
];

const createFacetResponse = (
  values: typeof baseFacetValues,
  {moreValuesAvailable = true}: {moreValuesAvailable?: boolean} = {}
) => ({
  facetId: 'filetype',
  field: 'filetype',
  moreValuesAvailable,
  values,
  label: 'File Type',
});

const mockDefaultFacetResponse = () => {
  searchApiHarness.searchEndpoint.mockOnce((response) => {
    if ('facets' in response) {
      return {
        ...response,
        facets: [
          ...(response.facets || []),
          createFacetResponse(baseFacetValues),
        ],
      };
    }
    return response;
  });
};

const {decorator, play} = wrapInSearchInterface();

const {events, argTypes} = getStorybookHelpers('atomic-color-facet', {
  excludeCategories: ['methods'],
});

const {template} = getStorybookHelpers('atomic-color-facet', {
  excludeCategories: ['methods', 'cssParts'],
});

const meta: Meta = {
  component: 'atomic-color-facet',
  title: 'Search/Facet (Color)',
  id: 'atomic-color-facet',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {handlers: [...searchApiHarness.handlers]},
  },
  argTypes,
  beforeEach: () => {
    searchApiHarness.searchEndpoint.clear();
    searchApiHarness.facetSearchEndpoint.clear();
    searchApiHarness.facetSearchEndpoint.mock(() => ({
      values: [
        {displayValue: 'Powerpoint', rawValue: 'Powerpoint', count: 76},
        {displayValue: 'PDF', rawValue: 'PDF', count: 43},
      ],
      moreValuesAvailable: false,
    }));
  },
  play,
};

export default meta;

const facetValueToCss = {
  Email: {
    'background-image': 'url("/assets/email.svg")',
    'background-color': 'rgb(149, 174, 197)',
  },
  Video: {
    'background-image': 'url("/assets/video.svg")',
    'background-color': 'rgb(176, 112, 230)',
  },
  Message: {
    'background-image': 'url("/assets/knowledge.svg")',
    'background-color': 'rgb(236, 148, 237)',
  },
  Thread: {
    'background-image': 'url("/assets/post.svg")',
    'background-color': 'rgb(101, 202, 228)',
  },
  HTML: {
    'background-image': 'url("/assets/html.svg")',
    'background-color': 'transparent',
  },
  Text: {
    'background-image': 'url("/assets/document.svg")',
    'background-color': 'rgb(144, 144, 144)',
  },
  PDF: {
    'background-image': 'url("/assets/document.svg")',
    'background-color': 'rgb(255, 100, 100)',
  },
  Powerpoint: {
    'background-image': 'url("/assets/document.svg")',
    'background-color': 'rgb(170, 62, 152)',
  },
};

const baseFacetValueCss = {
  'background-position': 'center',
  'background-size': 'contain',
  'background-repeat': 'no-repeat',
};

const colorFacetStylesDecorator = (story: () => unknown) => {
  const cssRules = Object.entries(facetValueToCss)
    .map(([facetValue, css]) => {
      const partValueSanitized = facetValue.replace(/[^a-z0-9]/gi, '');
      const cssProperties = Object.entries({
        ...baseFacetValueCss,
        ...css,
      })
        .map(([prop, value]) => `${prop}: ${value};`)
        .join('\n');

      const boxRule = `atomic-color-facet::part(value-${partValueSanitized}) {
          ${cssProperties}
        }`;

      return boxRule;
    })
    .join('\n');

  const checkboxSizing = `
        atomic-color-facet::part(value-checkbox) {
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 0.25rem;
          padding-right: 0.25rem;
          margin-top: 0.5rem;
        }
        atomic-color-facet::part(value-checkbox-label) {
          padding-left: 0.25rem;
          margin-top: 0.5rem;
        }`;

  return html`
    <style>
      ${cssRules}
      ${checkboxSizing}
    </style>
    ${story()}
  `;
};

export const Default: Story = {
  args: {
    field: 'filetype',
    label: 'File Type',
  },
  decorators: [facetDecorator, colorFacetStylesDecorator],
  beforeEach: () => {
    mockDefaultFacetResponse();
  },
};

export const CheckboxDisplay: Story = {
  name: 'Checkbox Display Mode',
  args: {
    field: 'filetype',
    label: 'File Type',
    'display-values-as': 'checkbox',
  },
  decorators: [facetDecorator, colorFacetStylesDecorator],
  beforeEach: () => {
    mockDefaultFacetResponse();
  },
};

export const WithSelectedValue: Story = {
  name: 'With Selected Value',
  args: {
    field: 'filetype',
    label: 'File Type',
  },
  decorators: [facetDecorator, colorFacetStylesDecorator],
  beforeEach: () => {
    const selectedValues = baseFacetValues.map((v) =>
      v.value === 'Email' ? {...v, state: 'selected'} : v
    );
    searchApiHarness.searchEndpoint.mockOnce((response) => {
      if ('facets' in response) {
        return {
          ...response,
          facets: [
            ...(response.facets || []),
            createFacetResponse(selectedValues),
          ],
        };
      }
      return response;
    });
  },
};
