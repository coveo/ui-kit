import {fromOpenApi} from '@mswjs/source/open-api';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import type {OpenAPIV3} from 'openapi-types';
import openApiDocument from '@/oapi-specs/commerce.json' with {type: 'json'};
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

const baseResponse = {
  responseId: '3c0369c4-41ae-4f3c-8536-2840d1ac2214',
  products: [],
  facets: [],
  pagination: {
    page: 0,
    perPage: 48,
    totalEntries: 0,
    totalPages: 0,
  },
  sort: {
    appliedSort: {
      sortCriteria: 'relevance',
    },
    availableSorts: [
      {
        sortCriteria: 'relevance',
      },
      {
        sortCriteria: 'fields',
        fields: [
          {
            field: 'ec_price',
            direction: 'asc',
            displayName: 'Price (Low to High)',
          },
        ],
      },
      {
        sortCriteria: 'fields',
        fields: [
          {
            field: 'ec_price',
            direction: 'desc',
            displayName: 'Price (High to Low)',
          },
        ],
      },
    ],
  },
  executionReport: null,
  triggers: [],
};

// Note: the OpenAPI document comes from https://platform.cloud.coveo.com/api-docs/CommerceService?group=public
// But has been _slightly_ modified to change the Content-Type from '*/*' to 'application/json'
Object.assign(
  openApiDocument.paths[
    '/rest/organizations/{organizationId}/commerce/v2/search'
  ].post.responses[200].content['application/json'],
  {
    example: {
      ...baseResponse,
      queryCorrection: {
        originalQuery: 'runing shoes',
        correctedQuery: "I'm using MSW and it works great!",
        corrections: [],
      },
    },
  }
);

const handlers = await fromOpenApi({
  ...(openApiDocument as OpenAPIV3.Document),
  basePath: 'https://searchuisamples.org.coveo.com',
});

const {decorator, afterEach} = wrapInCommerceInterface();

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-commerce-did-you-mean',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-commerce-did-you-mean',
  title: 'Commerce/Did You Mean',
  id: 'atomic-commerce-did-you-mean',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {
      handlers,
    },
  },
  args,
  argTypes,
  afterEach,
};

export default meta;

export const Default: Story = {};
