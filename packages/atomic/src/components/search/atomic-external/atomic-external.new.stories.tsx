import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import type {AtomicSearchInterface} from '@/src/components/search/atomic-search-interface/atomic-search-interface';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-external',
  {excludeCategories: ['methods']}
);

const externalComponentDecorator = (story: () => unknown) => html`
 <style>
        .wrapper {
          display: flex;
        }

        .wrapper > div {
          padding: 3rem;
        }

        .wrapper > div * {
          margin-bottom: 2rem;
        }

        h1 {
          font-size: 1rem;
        }
      </style>
      <div id="code-root">
        <div class="wrapper">
          <div>
            <h1>External components of interface #2</h1>
            ${story()}
          </div>
          <div>
            <h1>Interface #1, not linked to URL</h1>
            <atomic-search-interface
              data-interface-id="interface-1"
              pipeline="UI_KIT_E2E"
              search-hub="UI_KIT_E2E"
              reflect-state-in-url="false"
            >
              <atomic-query-summary></atomic-query-summary>
              <atomic-numeric-facet
                field="ec_price"
                label="Cost"
                with-input="integer"
              >
                <atomic-format-currency currency="USD"></atomic-format-currency>
              </atomic-numeric-facet>
              <atomic-search-box></atomic-search-box>
              <atomic-result-list></atomic-result-list>
            </atomic-search-interface>
          </div>
          <div>
            <h1>Interface #2, linked to URL</h1>
            <atomic-search-interface data-interface-id="interface-2">
              <atomic-query-summary></atomic-query-summary>
              <atomic-result-list></atomic-result-list>
            </atomic-search-interface>
          </div>
        </div>
      </div>
`;

const meta: Meta = {
  component: 'atomic-external',
  title: 'Search/External',
  id: 'atomic-external',
  render: (args) => template(args),
  decorators: [externalComponentDecorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  argTypes: {
    ...argTypes,
  },
  args: {
    ...args,
    selector: '[data-interface-id="interface-2"]',
    'default-slot': `
      <atomic-search-box></atomic-search-box>
      <atomic-query-summary></atomic-query-summary>
      <atomic-facet field="author" label="Author"></atomic-facet>
    `,
  },
  play: async (context) => {
    await customElements.whenDefined('atomic-search-interface');

    const searchInterfaces1 = context.canvasElement.querySelectorAll(
      "[data-interface-id='interface-1']"
    ) as NodeListOf<AtomicSearchInterface>;
    const searchInterfaces2 = context.canvasElement.querySelectorAll(
      "[data-interface-id='interface-2']"
    ) as NodeListOf<AtomicSearchInterface>;

    const initPromises: Promise<void>[] = [];

    searchInterfaces1.forEach((searchInterface1) => {
      initPromises.push(
        searchInterface1.initialize({
          accessToken: 'xxc23ce82a-3733-496e-b37e-9736168c4fd9',
          organizationId: 'electronicscoveodemocomo0n2fu8v',
          analytics: {
            analyticsMode: 'legacy',
          },
        })
      );
    });

    searchInterfaces2.forEach((searchInterface2) => {
      initPromises.push(
        searchInterface2.initialize({
          accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
          organizationId: 'searchuisamples',
          analytics: {
            analyticsMode: 'legacy',
          },
        })
      );
    });

    await Promise.all(initPromises);

    searchInterfaces1.forEach((searchInterface1) => {
      searchInterface1.executeFirstSearch();
    });
    searchInterfaces2.forEach((searchInterface2) => {
      searchInterface2.executeFirstSearch();
    });
  },
};

export default meta;

export const Default: StoryObj = {};
