import {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';

const meta: Meta = {
  component: 'atomic-external',
  title: 'Atomic/Atomic External',
  id: 'atomic-external',
  render: () => html`
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
    <div class="wrapper">
      <div>
        <h1>External components of interface #2</h1>
        <atomic-external selector="#interface-2">
          <atomic-search-box></atomic-search-box>
          <atomic-query-summary></atomic-query-summary>
          <atomic-facet field="author" label="Author"></atomic-facet>
        </atomic-external>
      </div>
      <div>
        <h1>Interface #1, not linked to URL</h1>
        <atomic-search-interface
          id="interface-1"
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
        <atomic-search-interface id="interface-2">
          <atomic-query-summary></atomic-query-summary>
          <atomic-result-list></atomic-result-list>
        </atomic-search-interface>
      </div>
    </div>
  `,
  play: async () => {
    await customElements.whenDefined('atomic-search-interface');

    const searchInterface1 = document.querySelector(
      '#interface-1'
    ) as HTMLAtomicSearchInterfaceElement;
    const searchInterface2 = document.querySelector(
      '#interface-2'
    ) as HTMLAtomicSearchInterfaceElement;

    await Promise.all([
      searchInterface1.initialize({
        accessToken: 'xxc23ce82a-3733-496e-b37e-9736168c4fd9',
        organizationId: 'electronicscoveodemocomo0n2fu8v',
        analytics: {
          analyticsMode: 'legacy',
        },
      }),
      searchInterface2.initialize({
        accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
        organizationId: 'searchuisamples',
        analytics: {
          analyticsMode: 'legacy',
        },
      }),
    ]);

    searchInterface1.executeFirstSearch();
    searchInterface2.executeFirstSearch();
  },
};

export default meta;

export const Default: StoryObj = {
  name: 'atomic-external',
};
