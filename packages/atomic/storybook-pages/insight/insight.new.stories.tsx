import {getSampleInsightEngineConfiguration} from '@coveo/headless/insight';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {MockInsightApi} from '@/storybook-utils/api/insight/mock.js';
import {
  type baseResponse,
  richResponse,
} from '@/storybook-utils/api/insight/search-response';
import {parameters} from '@/storybook-utils/common/common-meta-parameters.js';

async function initializeInsightInterface(canvasElement: HTMLElement) {
  await customElements.whenDefined('atomic-insight-interface');
  const insightInterface = canvasElement.querySelector(
    'atomic-insight-interface'
  );
  await insightInterface!.initialize(getSampleInsightEngineConfiguration());
}

const mockInsightApi = new MockInsightApi();

const meta: Meta = {
  component: 'insight-page',
  title: 'Insight/Example Pages',
  id: 'insight-page',
  parameters: {
    ...parameters,
    layout: 'fullscreen',
    msw: {
      handlers: [...mockInsightApi.handlers],
    },
    chromatic: {disableSnapshot: false},
  },
  beforeEach: async () => {
    mockInsightApi.searchEndpoint.mock(
      () => richResponse as unknown as typeof baseResponse
    );
  },
  render: () => html`
    <style>
      atomic-insight-interface:not([widget='false']),
      atomic-insight-layout:not([widget='false']) {
        width: 500px;
        height: 1000px;
        margin-left: auto;
        margin-right: auto;
        box-shadow: 0px 3px 24px 0px #0000001a;
      }
      .insights-header {
        display: flex;
        align-items: center;
        background-color: #f1f2ff;
      }
      .insights-header atomic-insight-generate-answer-button {
        padding: 0rem 1.5rem;
      }
      .insights-summary {
        flex-grow: 1;
      }
    </style>
    <atomic-insight-interface language-assets-path="./lang" icon-assets-path="./assets">
      <atomic-insight-full-search-button
        slot="full-search"
        tooltip="Full Search Button Tooltip"
      ></atomic-insight-full-search-button>
      <atomic-insight-layout>
        <atomic-layout-section section="search">
          <atomic-insight-search-box></atomic-insight-search-box>
          <atomic-insight-refine-toggle></atomic-insight-refine-toggle>
          <atomic-insight-edit-toggle tooltip="This is a tooltip"></atomic-insight-edit-toggle>
          <atomic-insight-history-toggle tooltip="This is a tooltip"></atomic-insight-history-toggle>
          <atomic-insight-tabs>
            <atomic-insight-tab label="All" expression="" active></atomic-insight-tab>
            <atomic-insight-tab label="Youtube" expression="@filetype==YouTubeVideo"></atomic-insight-tab>
            <atomic-insight-tab label="Folding" expression="@source=iNaturalistTaxons"></atomic-insight-tab>
            <atomic-insight-tab label="Service Cases" expression="@objecttype==Case"></atomic-insight-tab>
            <atomic-insight-tab label="Users" expression="@objecttype==User"></atomic-insight-tab>
            <atomic-insight-tab label="PDF" expression="@filetype==pdf"></atomic-insight-tab>
            <atomic-insight-tab label="Salesforce" expression="@filetype==SalesforceItem"></atomic-insight-tab>
          </atomic-insight-tabs>
        </atomic-layout-section>
        <atomic-layout-section section="facets">
          <atomic-facet-manager>
            <atomic-insight-facet field="source" label="Source" display-values-as="link"></atomic-insight-facet>
            <atomic-insight-facet field="filetype" label="File Type" display-values-as="checkbox"></atomic-insight-facet>
            <atomic-insight-numeric-facet
              field="ytlikecount"
              label="Popularity"
              display-values-as="link"
              with-input="integer"
            >
              <atomic-numeric-range start="0" end="1000" label="Low"></atomic-numeric-range>
              <atomic-numeric-range start="1000" end="8000" label="Medium"></atomic-numeric-range>
              <atomic-numeric-range start="8000" end="100000" label="High"></atomic-numeric-range>
              <atomic-numeric-range start="100000" end="999999999" label="Very High"></atomic-numeric-range>
            </atomic-insight-numeric-facet>
            <atomic-insight-timeframe-facet label="Date Range" with-date-picker heading-level="2">
              <atomic-timeframe unit="hour"></atomic-timeframe>
              <atomic-timeframe unit="day"></atomic-timeframe>
              <atomic-timeframe unit="week"></atomic-timeframe>
              <atomic-timeframe unit="month"></atomic-timeframe>
              <atomic-timeframe unit="quarter"></atomic-timeframe>
              <atomic-timeframe unit="year"></atomic-timeframe>
            </atomic-insight-timeframe-facet>
          </atomic-facet-manager>
        </atomic-layout-section>
        <atomic-layout-section section="status">
          <div class="insights-header">
            <div class="insights-summary">
              <atomic-insight-query-summary></atomic-insight-query-summary>
            </div>
            <atomic-insight-generate-answer-button></atomic-insight-generate-answer-button>
          </div>
        </atomic-layout-section>
        <atomic-layout-section section="results">
          <atomic-insight-smart-snippet></atomic-insight-smart-snippet>
          <atomic-insight-smart-snippet-suggestions></atomic-insight-smart-snippet-suggestions>
          <atomic-insight-result-list image-size="none">
            <atomic-insight-result-template>
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
                  .salesforce-badge::part(result-badge-element) {
                    background-color: #0092da;
                  }
                  .salesforce-badge::part(result-badge-label) {
                    color: white;
                  }
                </style>
                <atomic-insight-result-action-bar>
                  <atomic-insight-result-action
                    tooltip="Copy to Clipboard"
                    tooltip-on-click="Copied!"
                    action="copyToClipboard"
                  ></atomic-insight-result-action>
                  <atomic-insight-result-attach-to-case-action></atomic-insight-result-attach-to-case-action>
                  <atomic-insight-result-quickview-action></atomic-insight-result-quickview-action>
                </atomic-insight-result-action-bar>
                <atomic-result-section-badges>
                  <atomic-field-condition must-match-sourcetype="Salesforce">
                    <atomic-result-badge label="Salesforce" class="salesforce-badge"></atomic-result-badge>
                  </atomic-field-condition>
                  <atomic-field-condition if-defined="language">
                    <atomic-result-badge
                      icon="https://raw.githubusercontent.com/Rush/Font-Awesome-SVG-PNG/master/black/svg/language.svg"
                    >
                      <atomic-result-multi-value-text field="language"></atomic-result-multi-value-text>
                    </atomic-result-badge>
                  </atomic-field-condition>
                  <atomic-field-condition must-match-is-recommendation="true">
                    <atomic-result-badge label="Recommended"></atomic-result-badge>
                  </atomic-field-condition>
                  <atomic-field-condition must-match-is-top-result="true">
                    <atomic-result-badge label="Top Result"></atomic-result-badge>
                  </atomic-field-condition>
                </atomic-result-section-badges>
                <atomic-result-section-actions>
                  <atomic-insight-result-attach-to-case-indicator></atomic-insight-result-attach-to-case-indicator>
                </atomic-result-section-actions>
                <atomic-result-section-title>
                  <atomic-result-link></atomic-result-link>
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
                    <atomic-field-condition class="field" if-defined="sfid">
                      <span class="field-label"><atomic-text value="Record ID"></atomic-text>:</span>
                      <atomic-result-text field="sfid"></atomic-result-text>
                    </atomic-field-condition>
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
            </atomic-insight-result-template>
          </atomic-insight-result-list>
          <atomic-insight-no-results></atomic-insight-no-results>
          <atomic-insight-query-error></atomic-insight-query-error>
        </atomic-layout-section>
        <atomic-layout-section section="pagination">
          <atomic-insight-pager></atomic-insight-pager>
        </atomic-layout-section>
      </atomic-insight-layout>
    </atomic-insight-interface>
  `,
  play: async (context) => {
    await initializeInsightInterface(context.canvasElement);
    const insightInterface = context.canvasElement.querySelector(
      'atomic-insight-interface'
    );
    await insightInterface!.executeFirstSearch();
  },
};

export default meta;

export const Default: Story = {
  name: 'Insight Page',
};
