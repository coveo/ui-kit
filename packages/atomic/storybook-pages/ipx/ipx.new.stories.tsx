import {getSampleSearchEngineConfiguration} from '@coveo/headless';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {
  type baseResponse,
  richResponse,
} from '@/storybook-utils/api/search/search-response';
import {parameters} from '@/storybook-utils/common/common-meta-parameters.js';

async function initializeIpxInterface(canvasElement: HTMLElement) {
  await customElements.whenDefined('atomic-search-interface');
  const searchInterface = canvasElement.querySelector(
    'atomic-search-interface'
  );
  await searchInterface!.initialize(getSampleSearchEngineConfiguration());
}

const mockSearchApi = new MockSearchApi();

const meta: Meta = {
  component: 'ipx-page',
  title: 'IPX/Example Pages',
  id: 'ipx-page',
  parameters: {
    ...parameters,
    layout: 'fullscreen',
    msw: {
      handlers: [...mockSearchApi.handlers],
    },
    chromatic: {disableSnapshot: false},
  },
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mock(
      () => richResponse as unknown as typeof baseResponse
    );
  },
  render: () => html`
    <style>
      .search-section {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        grid-gap: 0.5rem;
        background: var(--atomic-neutral-light);
        box-sizing: border-box;
        min-width: 0;
      }

      .search-box {
        flex-grow: 1;
        padding-bottom: 0.875rem;
      }

      .query-summary {
        padding-bottom: 1rem;
      }

      .footer-slot {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .footer-link {
        color: var(--atomic-primary);
        text-decoration: none;
      }

      .footer-link:hover {
        text-decoration: underline;
      }

      atomic-ipx-tabs {
        width: 100%;
      }
    </style>
    <atomic-search-interface
      language-assets-path="./lang"
      icon-assets-path="./assets"
    >
      <atomic-ipx-modal is-open="true">
        <div slot="header">
          <atomic-layout-section class="search-section" section="search">
            <atomic-search-box class="search-box" textarea></atomic-search-box>
            <atomic-ipx-refine-toggle></atomic-ipx-refine-toggle>
            <atomic-ipx-tabs>
              <atomic-ipx-tab label="All" expression="" active></atomic-ipx-tab>
              <atomic-ipx-tab label="HTML" expression="@filetype==html"></atomic-ipx-tab>
              <atomic-ipx-tab label="PDF" expression="@filetype==pdf"></atomic-ipx-tab>
            </atomic-ipx-tabs>
          </atomic-layout-section>
        </div>
        <atomic-layout-section section="facets">
          <atomic-facet field="source" label="Source" display-values-as="checkbox"></atomic-facet>
          <atomic-facet field="filetype" label="Filetype" display-values-as="checkbox"></atomic-facet>
          <atomic-timeframe-facet label="Listed within" with-date-picker heading-level="2">
            <atomic-timeframe unit="hour"></atomic-timeframe>
            <atomic-timeframe unit="day"></atomic-timeframe>
            <atomic-timeframe unit="week"></atomic-timeframe>
            <atomic-timeframe unit="month"></atomic-timeframe>
          </atomic-timeframe-facet>
        </atomic-layout-section>
        <div slot="body">
          <atomic-layout-section section="status">
            <atomic-query-summary class="query-summary"></atomic-query-summary>
            <atomic-did-you-mean></atomic-did-you-mean>
            <atomic-notifications></atomic-notifications>
          </atomic-layout-section>
          <atomic-layout-section section="results">
            <atomic-smart-snippet></atomic-smart-snippet>
            <atomic-smart-snippet-suggestions></atomic-smart-snippet-suggestions>
            <atomic-result-list image-size="none">
              <atomic-result-template>
                <template>
                  <style>
                    .field {
                      display: inline-flex;
                      align-items: center;
                    }
                    .field-label {
                      font-weight: bold;
                      margin-right: 0.25rem;
                    }
                  </style>
                  <atomic-result-section-badges>
                    <atomic-field-condition must-match-sourcetype="Salesforce">
                      <atomic-result-badge label="Salesforce"></atomic-result-badge>
                    </atomic-field-condition>
                    <atomic-field-condition must-match-is-recommendation="true">
                      <atomic-result-badge label="Recommended"></atomic-result-badge>
                    </atomic-field-condition>
                    <atomic-field-condition must-match-is-top-result="true">
                      <atomic-result-badge label="Top Result"></atomic-result-badge>
                    </atomic-field-condition>
                  </atomic-result-section-badges>
                  <atomic-result-section-title>
                    <atomic-ipx-result-link></atomic-ipx-result-link>
                  </atomic-result-section-title>
                  <atomic-result-section-title-metadata>
                    <atomic-field-condition class="field" if-defined="snrating">
                      <atomic-result-rating field="snrating"></atomic-result-rating>
                    </atomic-field-condition>
                    <atomic-field-condition class="field" if-not-defined="snrating">
                      <atomic-result-printable-uri max-number-of-parts="3"></atomic-result-printable-uri>
                    </atomic-field-condition>
                  </atomic-result-section-title-metadata>
                  <atomic-result-section-excerpt>
                    <atomic-result-text field="excerpt"></atomic-result-text>
                  </atomic-result-section-excerpt>
                  <atomic-result-section-bottom-metadata>
                    <atomic-result-fields-list>
                      <atomic-field-condition class="field" if-defined="author">
                        <span class="field-label"><atomic-text value="author"></atomic-text>:</span>
                        <atomic-result-text field="author"></atomic-result-text>
                      </atomic-field-condition>
                      <atomic-field-condition class="field" if-defined="source">
                        <span class="field-label"><atomic-text value="source"></atomic-text>:</span>
                        <atomic-result-text field="source"></atomic-result-text>
                      </atomic-field-condition>
                      <atomic-field-condition class="field" if-defined="filetype">
                        <span class="field-label"><atomic-text value="fileType"></atomic-text>:</span>
                        <atomic-result-text field="filetype"></atomic-result-text>
                      </atomic-field-condition>
                      <span class="field">
                        <span class="field-label">Date:</span>
                        <atomic-result-date format="ddd MMM D YYYY"></atomic-result-date>
                      </span>
                    </atomic-result-fields-list>
                  </atomic-result-section-bottom-metadata>
                </template>
              </atomic-result-template>
            </atomic-result-list>
            <atomic-query-error></atomic-query-error>
            <atomic-no-results></atomic-no-results>
          </atomic-layout-section>
          <atomic-layout-section section="pagination">
            <atomic-load-more-results></atomic-load-more-results>
          </atomic-layout-section>
        </div>
        <div class="footer-slot" slot="footer">
          <a class="footer-link" href="https://coveo.com" target="_blank">Powered by Coveo</a>
        </div>
      </atomic-ipx-modal>
      <atomic-ipx-button label="Help"></atomic-ipx-button>
    </atomic-search-interface>
  `,
  play: async (context) => {
    await initializeIpxInterface(context.canvasElement);
    const searchInterface = context.canvasElement.querySelector(
      'atomic-search-interface'
    );
    await searchInterface!.executeFirstSearch();

    // Click the IPX button to open the modal
    const ipxButton = context.canvasElement.querySelector('atomic-ipx-button');
    if (ipxButton) {
      const shadowRoot = ipxButton.shadowRoot;
      if (shadowRoot) {
        const button = shadowRoot.querySelector('button');
        if (button) {
          button.click();
        }
      }
    }
  },
};

export default meta;

export const Default: Story = {
  name: 'IPX Modal Page',
};
