import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {HttpResponse, http} from 'msw';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

const {decorator, afterEach} = wrapInCommerceInterface({
  engineConfig: {
    preprocessRequest: (request) => {
      const parsed = JSON.parse(request.body as string);
      parsed.query = 'runing shoes';
      request.body = JSON.stringify(parsed);
      return request;
    },
  },
});

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
      handlers: {
        commerce: [
          http.post(
            'https://searchuisamples.org.coveo.com/rest/organizations/searchuisamples/commerce/v2/search',
            () => {
              return HttpResponse.json({
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
                queryCorrection: {
                  originalQuery: 'runing shoes',
                  correctedQuery: "I'm using MSW and it works great!",
                  corrections: [],
                },
              });
            }
          ),
        ],
      },
    },
  },
  args,
  argTypes,
  afterEach,
};

export default meta;

export const Default: Story = {};
