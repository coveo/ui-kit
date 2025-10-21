/* eslint-disable @cspell/spellchecker */

import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const {decorator, play} = wrapInInsightInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-insight-interface',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-insight-interface',
  title: 'Insight/Interface',
  id: 'atomic-insight-interface',

  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,
  play,
};

export default meta;

export const Default: Story = {
  decorators: [
    () =>
      html`<atomic-insight-layout>
        <style>
          atomic-insight-search-box {
            position: relative;
          }

          atomic-insight-search-box::part(wrapper) {
            top: 0;
            left: 0;
            max-width: unset;
          }

          atomic-insight-pager {
            height: 4em;
          }

          atomic-insight-interface:not([widget='false']),
          atomic-insight-layout:not([widget='false']) {
            height: auto;
          }
        </style>
        <atomic-layout-section section="search">
          <atomic-insight-search-box></atomic-insight-search-box>
          <atomic-insight-refine-toggle></atomic-insight-refine-toggle>
          <atomic-insight-user-actions-toggle></atomic-insight-user-actions-toggle>
          <atomic-insight-tabs>
            <atomic-insight-tab
              label="All"
              expression=""
              active="true"
            ></atomic-insight-tab>
            <atomic-insight-tab
              label="Videos"
              expression="@ytchanneltitle"
            ></atomic-insight-tab>
            <atomic-insight-tab
              label="Documentation"
              expression='@documenttype==("WebPage")'
            ></atomic-insight-tab>
          </atomic-insight-tabs>
        </atomic-layout-section>
        <atomic-layout-section section="facets">
          <atomic-insight-timeframe-facet
            field="date"
            label="Date"
            with-date-picker="true"
          >
            <atomic-timeframe unit="hour"></atomic-timeframe>
            <atomic-timeframe unit="day"></atomic-timeframe>
            <atomic-timeframe unit="week"></atomic-timeframe>
            <atomic-timeframe unit="month"></atomic-timeframe>
            <atomic-timeframe unit="quarter"></atomic-timeframe>
            <atomic-timeframe
              unit="year"
            ></atomic-timeframe> </atomic-insight-timeframe-facet
          ><atomic-insight-facet
            field="source"
            label="Source"
            display-values-as="checkbox"
          ></atomic-insight-facet
          ><atomic-insight-facet
            field="documenttype"
            label="Item type"
            display-values-as="checkbox"
          ></atomic-insight-facet>
        </atomic-layout-section>
        <atomic-layout-section section="status">
          <atomic-insight-query-summary></atomic-insight-query-summary>
        </atomic-layout-section>
        <atomic-layout-section section="results">
          <atomic-insight-generated-answer collapsible="true">
          </atomic-insight-generated-answer>
          <atomic-insight-folded-result-list image-size="none">
            <atomic-insight-result-template must-match-sourcetype="YouTube">
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

                  .thumbnail {
                    display: none;
                    width: 100%;
                    height: 100%;
                  }

                  .icon {
                    display: none;
                  }

                  .result-root.image-small .thumbnail,
                  .result-root.image-large .thumbnail {
                    display: inline-block;
                  }

                  .result-root.image-icon .icon {
                    display: inline-block;
                  }

                  .result-root.image-small atomic-result-section-visual,
                  .result-root.image-large atomic-result-section-visual {
                    border-radius: var(--atomic-border-radius-xl);
                  }

                  .result-root:has(atomic-result-section-children:hover) {
                    atomic-insight-result-action-bar {
                      visibility: hidden;
                    }
                  }

                  atomic-insight-result-action-bar atomic-icon {
                    color: var(--atomic-neutral-dark);
                  }

                  atomic-insight-result-action-bar button:hover atomic-icon {
                    color: var(--atomic-primary);
                  }

                  .badge-documenttype::part(result-badge-element) {
                    background-color: #ffdbdb;
                  }

                  .badge-documenttype::part(result-badge-label) {
                    color: #000000;
                  }

                  .tag-featured::part(result-badge-element) {
                    background-color: #b070e6;
                  }

                  .tag-featured::part(result-badge-label) {
                    color: #ffffff;
                  }

                  .tag-featured::part(result-badge-icon) {
                    fill: #ffffff;
                  }

                  .tag-recommended::part(result-badge-element) {
                    background-color: #4fbe75;
                  }

                  .tag-recommended::part(result-badge-label) {
                    color: #ffffff;
                  }

                  .tag-recommended::part(result-badge-icon) {
                    fill: #ffffff;
                  }

                  .viewed-by-customer {
                    display: inline-flex;
                    align-items: center;
                    flex-basis: 100%;
                    margin-top: 0.5rem;
                  }

                  .viewed-by-customer atomic-icon {
                    background-color: var(--atomic-neutral-dark);
                    border-radius: 1rem;
                    width: 0.75rem;
                    height: 0.75rem;
                  }

                  .viewed-by-customer atomic-text {
                    font-weight: bold;
                    color: var(--atomic-on-background);
                    margin-left: 0.25rem;
                  }
                </style>
                <atomic-insight-result-action-bar>
                  <atomic-insight-result-attach-to-case-action></atomic-insight-result-attach-to-case-action>
                  <atomic-insight-result-action
                    action="copyToClipboard"
                    tooltip="Copy"
                  >
                  </atomic-insight-result-action>
                  <atomic-insight-result-quickview-action></atomic-insight-result-quickview-action>
                </atomic-insight-result-action-bar>
                <atomic-result-section-badges>
                  <atomic-result-badge
                    class="badge-documenttype"
                    field="documenttype"
                  ></atomic-result-badge>
                  <atomic-field-condition must-match-is-recommendation="true">
                    <atomic-result-badge
                      class="tag-recommended"
                      label="Recommended"
                      icon='&lt;svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52" xml:space="preserve"&gt;&lt;path d="m27.4 3.1 4.6 15c.2.6.8.9 1.4.9h15c1.5 0 2.1 2 .9 2.9l-12.2 9c-.5.4-.7 1.1-.5 1.7L42.4 48c.4 1.4-1.1 2.6-2.3 1.7L27 39.9c-.5-.4-1.2-.4-1.8 0L12 49.7c-1.2.9-2.8-.3-2.3-1.7l5.6-15.4c.2-.6 0-1.3-.5-1.7l-12.2-9c-1.2-.9-.5-2.9.9-2.9h15c.7 0 1.2-.2 1.4-.9L24.6 3c.4-1.4 2.4-1.3 2.8.1z"/&gt;&lt;/svg&gt;'
                    ></atomic-result-badge>
                  </atomic-field-condition>
                  <atomic-field-condition must-match-is-top-result="true">
                    <atomic-result-badge
                      class="tag-featured"
                      label="Featured"
                      icon='&lt;svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"&gt;&lt;path fill-rule="evenodd" clip-rule="evenodd" d="M9.85379 6.35384H9.71917L8.80379 2.09999H9.0461C9.47687 2.09999 9.82687 1.74999 9.82687 1.31922C9.82687 0.888452 9.47687 0.538452 9.0461 0.538452H4.79225C4.36148 0.538452 4.01148 0.888452 4.01148 1.31922C4.01148 1.74999 4.36148 2.09999 4.79225 2.09999H5.03456L4.1461 6.35384H4.01148C3.58071 6.35384 3.23071 6.70384 3.23071 7.13461C3.23071 7.56537 3.58071 7.91537 4.01148 7.91537H6.27302V12.6C6.27302 13.0308 6.62302 13.4077 7.08071 13.4077C7.53841 13.4077 7.88841 13.0577 7.88841 12.6V7.9423H9.88071C10.3115 7.9423 10.6615 7.5923 10.6615 7.16153C10.6615 6.73076 10.2846 6.35384 9.85379 6.35384Z" /&gt;&lt;/svg&gt;'
                    ></atomic-result-badge>
                  </atomic-field-condition>
                </atomic-result-section-badges>
                <atomic-result-section-title>
                  <atomic-result-link data-testid="video-insight-result-link">
                    <a slot="attributes" target="_self"></a>
                  </atomic-result-link>
                </atomic-result-section-title>
                <atomic-result-section-title-metadata>
                </atomic-result-section-title-metadata>
                <atomic-result-section-excerpt>
                  <atomic-result-text field="excerpt"></atomic-result-text>
                </atomic-result-section-excerpt>
                <atomic-result-section-bottom-metadata>
                  <atomic-result-fields-list>
                    <atomic-field-condition
                      class="field"
                      if-defined="ytchanneltitle"
                    >
                      <span class="field-label"
                        ><atomic-text value="Channel"></atomic-text>:</span
                      >
                      <atomic-result-text
                        field="ytchanneltitle"
                      ></atomic-result-text>
                    </atomic-field-condition>
                    <atomic-field-condition
                      class="field"
                      if-defined="ytviewcount"
                    >
                      <span class="field-label"
                        ><atomic-text value="Views"></atomic-text>:</span
                      >
                      <atomic-result-number
                        field="ytviewcount"
                      ></atomic-result-number>
                    </atomic-field-condition>
                    <atomic-field-condition
                      class="viewed-by-customer"
                      must-match-is-user-action-view="true"
                    >
                      <atomic-icon icon="assets://user.svg"></atomic-icon>
                      <atomic-text value="viewed-by-customer"></atomic-text>
                    </atomic-field-condition>
                  </atomic-result-fields-list>
                </atomic-result-section-bottom-metadata>
                <atomic-result-section-children>
                  <atomic-insight-result-children no-result-text="">
                    <atomic-insight-result-children-template>
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

                          .thumbnail {
                            display: none;
                            width: 100%;
                            height: 100%;
                          }

                          .icon {
                            display: none;
                          }

                          .result-root.image-small .thumbnail,
                          .result-root.image-large .thumbnail {
                            display: inline-block;
                          }

                          .result-root.image-icon .icon {
                            display: inline-block;
                          }

                          .result-root.image-small atomic-result-section-visual,
                          .result-root.image-large
                            atomic-result-section-visual {
                            border-radius: var(--atomic-border-radius-xl);
                          }

                          .result-root:has(
                              atomic-result-section-children:hover
                            ) {
                            atomic-insight-result-action-bar {
                              visibility: hidden;
                            }
                          }

                          atomic-insight-result-action-bar atomic-icon {
                            color: var(--atomic-neutral-dark);
                          }

                          atomic-insight-result-action-bar
                            button:hover
                            atomic-icon {
                            color: var(--atomic-primary);
                          }

                          .badge-documenttype::part(result-badge-element) {
                            background-color: #ffdbdb;
                          }

                          .badge-documenttype::part(result-badge-label) {
                            color: #000000;
                          }

                          .tag-featured::part(result-badge-element) {
                            background-color: #b070e6;
                          }

                          .tag-featured::part(result-badge-label) {
                            color: #ffffff;
                          }

                          .tag-featured::part(result-badge-icon) {
                            fill: #ffffff;
                          }

                          .tag-recommended::part(result-badge-element) {
                            background-color: #4fbe75;
                          }

                          .tag-recommended::part(result-badge-label) {
                            color: #ffffff;
                          }

                          .tag-recommended::part(result-badge-icon) {
                            fill: #ffffff;
                          }

                          .viewed-by-customer {
                            display: inline-flex;
                            align-items: center;
                            flex-basis: 100%;
                            margin-top: 0.5rem;
                          }

                          .viewed-by-customer atomic-icon {
                            background-color: var(--atomic-neutral-dark);
                            border-radius: 1rem;
                            width: 0.75rem;
                            height: 0.75rem;
                          }

                          .viewed-by-customer atomic-text {
                            font-weight: bold;
                            color: var(--atomic-on-background);
                            margin-left: 0.25rem;
                          }
                        </style>
                        <atomic-insight-result-action-bar>
                          <atomic-insight-result-attach-to-case-action></atomic-insight-result-attach-to-case-action>
                          <atomic-insight-result-action
                            action="copyToClipboard"
                            tooltip="Copy"
                          ></atomic-insight-result-action>
                          <atomic-insight-result-quickview-action>
                          </atomic-insight-result-quickview-action> </atomic-insight-result-action-bar
                        ><atomic-result-section-badges>
                          <atomic-result-badge
                            class="badge-documenttype"
                            field="documenttype"
                          ></atomic-result-badge>
                          <atomic-field-condition
                            must-match-is-recommendation="true"
                          >
                            <atomic-result-badge
                              class="tag-recommended"
                              label="Recommended"
                              icon='&lt;svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52" xml:space="preserve"&gt;&lt;path d="m27.4 3.1 4.6 15c.2.6.8.9 1.4.9h15c1.5 0 2.1 2 .9 2.9l-12.2 9c-.5.4-.7 1.1-.5 1.7L42.4 48c.4 1.4-1.1 2.6-2.3 1.7L27 39.9c-.5-.4-1.2-.4-1.8 0L12 49.7c-1.2.9-2.8-.3-2.3-1.7l5.6-15.4c.2-.6 0-1.3-.5-1.7l-12.2-9c-1.2-.9-.5-2.9.9-2.9h15c.7 0 1.2-.2 1.4-.9L24.6 3c.4-1.4 2.4-1.3 2.8.1z"/&gt;&lt;/svg&gt;'
                            ></atomic-result-badge>
                          </atomic-field-condition>
                          <atomic-field-condition
                            must-match-is-top-result="true"
                          >
                            <atomic-result-badge
                              class="tag-featured"
                              label="Featured"
                              icon='&lt;svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"&gt;&lt;path fill-rule="evenodd" clip-rule="evenodd" d="M9.85379 6.35384H9.71917L8.80379 2.09999H9.0461C9.47687 2.09999 9.82687 1.74999 9.82687 1.31922C9.82687 0.888452 9.47687 0.538452 9.0461 0.538452H4.79225C4.36148 0.538452 4.01148 0.888452 4.01148 1.31922C4.01148 1.74999 4.36148 2.09999 4.79225 2.09999H5.03456L4.1461 6.35384H4.01148C3.58071 6.35384 3.23071 6.70384 3.23071 7.13461C3.23071 7.56537 3.58071 7.91537 4.01148 7.91537H6.27302V12.6C6.27302 13.0308 6.62302 13.4077 7.08071 13.4077C7.53841 13.4077 7.88841 13.0577 7.88841 12.6V7.9423H9.88071C10.3115 7.9423 10.6615 7.5923 10.6615 7.16153C10.6615 6.73076 10.2846 6.35384 9.85379 6.35384Z" /&gt;&lt;/svg&gt;'
                            ></atomic-result-badge>
                          </atomic-field-condition> </atomic-result-section-badges
                        ><atomic-result-section-title>
                          <atomic-result-link>
                            <a
                              slot="attributes"
                              target="_self"
                            ></a> </atomic-result-link></atomic-result-section-title
                        ><atomic-result-section-title-metadata></atomic-result-section-title-metadata
                        ><atomic-result-section-excerpt>
                          <atomic-result-text
                            field="excerpt"
                          ></atomic-result-text></atomic-result-section-excerpt
                        ><atomic-result-section-bottom-metadata>
                          <atomic-result-fields-list>
                            <atomic-field-condition
                              class="field"
                              if-defined="ytchanneltitle"
                            >
                              <span class="field-label"
                                ><atomic-text value="Channel"></atomic-text
                                >:</span
                              >
                              <atomic-result-text
                                field="ytchanneltitle"
                              ></atomic-result-text>
                            </atomic-field-condition>
                            <atomic-field-condition
                              class="field"
                              if-defined="ytviewcount"
                            >
                              <span class="field-label"
                                ><atomic-text value="Views"></atomic-text
                                >:</span
                              >
                              <atomic-result-number
                                field="ytviewcount"
                              ></atomic-result-number>
                            </atomic-field-condition>
                            <atomic-field-condition
                              class="viewed-by-customer"
                              must-match-is-user-action-view="true"
                            >
                              <atomic-icon
                                icon="assets://user.svg"
                              ></atomic-icon>
                              <atomic-text
                                value="viewed-by-customer"
                              ></atomic-text>
                            </atomic-field-condition> </atomic-result-fields-list
                        ></atomic-result-section-bottom-metadata>
                        <atomic-result-section-children>
                          <atomic-insight-result-children
                            inherit-templates
                            no-result-text=""
                          >
                          </atomic-insight-result-children>
                        </atomic-result-section-children>
                      </template>
                    </atomic-insight-result-children-template>
                  </atomic-insight-result-children>
                </atomic-result-section-children>
              </template>
            </atomic-insight-result-template>
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

                  .thumbnail {
                    display: none;
                    width: 100%;
                    height: 100%;
                  }

                  .icon {
                    display: none;
                  }

                  .result-root.image-small .thumbnail,
                  .result-root.image-large .thumbnail {
                    display: inline-block;
                  }

                  .result-root.image-icon .icon {
                    display: inline-block;
                  }

                  .result-root.image-small atomic-result-section-visual,
                  .result-root.image-large atomic-result-section-visual {
                    border-radius: var(--atomic-border-radius-xl);
                  }

                  .result-root:has(atomic-result-section-children:hover) {
                    atomic-insight-result-action-bar {
                      visibility: hidden;
                    }
                  }

                  atomic-insight-result-action-bar atomic-icon {
                    color: var(--atomic-neutral-dark);
                  }

                  atomic-insight-result-action-bar button:hover atomic-icon {
                    color: var(--atomic-primary);
                  }

                  .badge-documenttype::part(result-badge-element) {
                    background-color: #6378a6;
                  }

                  .badge-documenttype::part(result-badge-label) {
                    color: #ffffff;
                  }

                  .tag-featured::part(result-badge-element) {
                    background-color: #b070e6;
                  }

                  .tag-featured::part(result-badge-label) {
                    color: #ffffff;
                  }

                  .tag-featured::part(result-badge-icon) {
                    fill: #ffffff;
                  }

                  .tag-recommended::part(result-badge-element) {
                    background-color: #4fbe75;
                  }

                  .tag-recommended::part(result-badge-label) {
                    color: #ffffff;
                  }

                  .tag-recommended::part(result-badge-icon) {
                    fill: #ffffff;
                  }

                  .viewed-by-customer {
                    display: inline-flex;
                    align-items: center;
                    flex-basis: 100%;
                    margin-top: 0.5rem;
                  }

                  .viewed-by-customer atomic-icon {
                    background-color: var(--atomic-neutral-dark);
                    border-radius: 1rem;
                    width: 0.75rem;
                    height: 0.75rem;
                  }

                  .viewed-by-customer atomic-text {
                    font-weight: bold;
                    color: var(--atomic-on-background);
                    margin-left: 0.25rem;
                  }
                </style>
                <atomic-insight-result-action-bar>
                  <atomic-insight-result-attach-to-case-action>
                  </atomic-insight-result-attach-to-case-action>
                  <atomic-insight-result-action
                    action="copyToClipboard"
                    tooltip="Copy"
                  >
                  </atomic-insight-result-action>
                  <atomic-insight-result-quickview-action>
                  </atomic-insight-result-quickview-action>
                </atomic-insight-result-action-bar>
                <atomic-result-section-badges>
                  <atomic-result-badge
                    class="badge-documenttype"
                    field="documenttype"
                  >
                  </atomic-result-badge>
                  <atomic-field-condition must-match-is-recommendation="true">
                    <atomic-result-badge
                      class="tag-recommended"
                      label="Recommended"
                      icon='&lt;svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52" xml:space="preserve"&gt;&lt;path d="m27.4 3.1 4.6 15c.2.6.8.9 1.4.9h15c1.5 0 2.1 2 .9 2.9l-12.2 9c-.5.4-.7 1.1-.5 1.7L42.4 48c.4 1.4-1.1 2.6-2.3 1.7L27 39.9c-.5-.4-1.2-.4-1.8 0L12 49.7c-1.2.9-2.8-.3-2.3-1.7l5.6-15.4c.2-.6 0-1.3-.5-1.7l-12.2-9c-1.2-.9-.5-2.9.9-2.9h15c.7 0 1.2-.2 1.4-.9L24.6 3c.4-1.4 2.4-1.3 2.8.1z"/&gt;&lt;/svg&gt;'
                    ></atomic-result-badge>
                  </atomic-field-condition>
                  <atomic-field-condition must-match-is-top-result="true">
                    <atomic-result-badge
                      class="tag-featured"
                      label="Featured"
                      icon='&lt;svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"&gt;&lt;path fill-rule="evenodd" clip-rule="evenodd" d="M9.85379 6.35384H9.71917L8.80379 2.09999H9.0461C9.47687 2.09999 9.82687 1.74999 9.82687 1.31922C9.82687 0.888452 9.47687 0.538452 9.0461 0.538452H4.79225C4.36148 0.538452 4.01148 0.888452 4.01148 1.31922C4.01148 1.74999 4.36148 2.09999 4.79225 2.09999H5.03456L4.1461 6.35384H4.01148C3.58071 6.35384 3.23071 6.70384 3.23071 7.13461C3.23071 7.56537 3.58071 7.91537 4.01148 7.91537H6.27302V12.6C6.27302 13.0308 6.62302 13.4077 7.08071 13.4077C7.53841 13.4077 7.88841 13.0577 7.88841 12.6V7.9423H9.88071C10.3115 7.9423 10.6615 7.5923 10.6615 7.16153C10.6615 6.73076 10.2846 6.35384 9.85379 6.35384Z" /&gt;&lt;/svg&gt;'
                    ></atomic-result-badge>
                  </atomic-field-condition>
                </atomic-result-section-badges>
                <atomic-result-section-title>
                  <atomic-result-link>
                    <a slot="attributes" target="_self"></a>
                  </atomic-result-link>
                </atomic-result-section-title>
                <atomic-result-section-title-metadata>
                </atomic-result-section-title-metadata>
                <atomic-result-section-excerpt>
                  <atomic-result-text field="excerpt"></atomic-result-text>
                </atomic-result-section-excerpt>
                <atomic-result-section-bottom-metadata>
                  <atomic-result-fields-list>
                    <atomic-field-condition
                      class="viewed-by-customer"
                      must-match-is-user-action-view="true"
                    >
                      <atomic-icon icon="assets://user.svg"></atomic-icon>
                      <atomic-text value="viewed-by-customer"></atomic-text>
                    </atomic-field-condition>
                  </atomic-result-fields-list>
                </atomic-result-section-bottom-metadata>
                <atomic-result-section-children>
                  <atomic-insight-result-children no-result-text="">
                    <atomic-insight-result-children-template>
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

                          .thumbnail {
                            display: none;
                            width: 100%;
                            height: 100%;
                          }

                          .icon {
                            display: none;
                          }

                          .result-root.image-small .thumbnail,
                          .result-root.image-large .thumbnail {
                            display: inline-block;
                          }

                          .result-root.image-icon .icon {
                            display: inline-block;
                          }

                          .result-root.image-small atomic-result-section-visual,
                          .result-root.image-large
                            atomic-result-section-visual {
                            border-radius: var(--atomic-border-radius-xl);
                          }

                          .result-root:has(
                              atomic-result-section-children:hover
                            ) {
                            atomic-insight-result-action-bar {
                              visibility: hidden;
                            }
                          }

                          atomic-insight-result-action-bar atomic-icon {
                            color: var(--atomic-neutral-dark);
                          }

                          atomic-insight-result-action-bar
                            button:hover
                            atomic-icon {
                            color: var(--atomic-primary);
                          }

                          .badge-documenttype::part(result-badge-element) {
                            background-color: #6378a6;
                          }

                          .badge-documenttype::part(result-badge-label) {
                            color: #ffffff;
                          }

                          .tag-featured::part(result-badge-element) {
                            background-color: #b070e6;
                          }

                          .tag-featured::part(result-badge-label) {
                            color: #ffffff;
                          }

                          .tag-featured::part(result-badge-icon) {
                            fill: #ffffff;
                          }

                          .tag-recommended::part(result-badge-element) {
                            background-color: #4fbe75;
                          }

                          .tag-recommended::part(result-badge-label) {
                            color: #ffffff;
                          }

                          .tag-recommended::part(result-badge-icon) {
                            fill: #ffffff;
                          }

                          .viewed-by-customer {
                            display: inline-flex;
                            align-items: center;
                            flex-basis: 100%;
                            margin-top: 0.5rem;
                          }

                          .viewed-by-customer atomic-icon {
                            background-color: var(--atomic-neutral-dark);
                            border-radius: 1rem;
                            width: 0.75rem;
                            height: 0.75rem;
                          }

                          .viewed-by-customer atomic-text {
                            font-weight: bold;
                            color: var(--atomic-on-background);
                            margin-left: 0.25rem;
                          }</style
                        ><atomic-insight-result-action-bar>
                          <atomic-insight-result-attach-to-case-action></atomic-insight-result-attach-to-case-action>
                          <atomic-insight-result-action
                            action="copyToClipboard"
                            tooltip="Copy"
                          ></atomic-insight-result-action>
                          <atomic-insight-result-quickview-action></atomic-insight-result-quickview-action> </atomic-insight-result-action-bar
                        ><atomic-result-section-badges>
                          <atomic-result-badge
                            class="badge-documenttype"
                            field="documenttype"
                          ></atomic-result-badge>
                          <atomic-field-condition
                            must-match-is-recommendation="true"
                          >
                            <atomic-result-badge
                              class="tag-recommended"
                              label="Recommended"
                              icon='&lt;svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52" xml:space="preserve"&gt;&lt;path d="m27.4 3.1 4.6 15c.2.6.8.9 1.4.9h15c1.5 0 2.1 2 .9 2.9l-12.2 9c-.5.4-.7 1.1-.5 1.7L42.4 48c.4 1.4-1.1 2.6-2.3 1.7L27 39.9c-.5-.4-1.2-.4-1.8 0L12 49.7c-1.2.9-2.8-.3-2.3-1.7l5.6-15.4c.2-.6 0-1.3-.5-1.7l-12.2-9c-1.2-.9-.5-2.9.9-2.9h15c.7 0 1.2-.2 1.4-.9L24.6 3c.4-1.4 2.4-1.3 2.8.1z"/&gt;&lt;/svg&gt;'
                            ></atomic-result-badge>
                          </atomic-field-condition>
                          <atomic-field-condition
                            must-match-is-top-result="true"
                          >
                            <atomic-result-badge
                              class="tag-featured"
                              label="Featured"
                              icon='&lt;svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"&gt;&lt;path fill-rule="evenodd" clip-rule="evenodd" d="M9.85379 6.35384H9.71917L8.80379 2.09999H9.0461C9.47687 2.09999 9.82687 1.74999 9.82687 1.31922C9.82687 0.888452 9.47687 0.538452 9.0461 0.538452H4.79225C4.36148 0.538452 4.01148 0.888452 4.01148 1.31922C4.01148 1.74999 4.36148 2.09999 4.79225 2.09999H5.03456L4.1461 6.35384H4.01148C3.58071 6.35384 3.23071 6.70384 3.23071 7.13461C3.23071 7.56537 3.58071 7.91537 4.01148 7.91537H6.27302V12.6C6.27302 13.0308 6.62302 13.4077 7.08071 13.4077C7.53841 13.4077 7.88841 13.0577 7.88841 12.6V7.9423H9.88071C10.3115 7.9423 10.6615 7.5923 10.6615 7.16153C10.6615 6.73076 10.2846 6.35384 9.85379 6.35384Z" /&gt;&lt;/svg&gt;'
                            ></atomic-result-badge>
                          </atomic-field-condition> </atomic-result-section-badges
                        ><atomic-result-section-title>
                          <atomic-result-link>
                            <a
                              slot="attributes"
                              target="_self"
                            ></a> </atomic-result-link></atomic-result-section-title
                        ><atomic-result-section-title-metadata></atomic-result-section-title-metadata
                        ><atomic-result-section-excerpt>
                          <atomic-result-text
                            field="excerpt"
                          ></atomic-result-text></atomic-result-section-excerpt
                        ><atomic-result-section-bottom-metadata>
                          <atomic-result-fields-list>
                            <atomic-field-condition
                              class="viewed-by-customer"
                              must-match-is-user-action-view="true"
                            >
                              <atomic-icon
                                icon="assets://user.svg"
                              ></atomic-icon>
                              <atomic-text
                                value="viewed-by-customer"
                              ></atomic-text>
                            </atomic-field-condition> </atomic-result-fields-list
                        ></atomic-result-section-bottom-metadata>
                        <atomic-result-section-children>
                          <atomic-insight-result-children
                            inherit-templates
                            no-result-text=""
                          >
                          </atomic-insight-result-children>
                        </atomic-result-section-children>
                      </template>
                    </atomic-insight-result-children-template>
                  </atomic-insight-result-children>
                </atomic-result-section-children>
              </template>
            </atomic-insight-result-template>
          </atomic-insight-folded-result-list>
          <atomic-insight-no-results></atomic-insight-no-results>
          <atomic-insight-query-error></atomic-insight-query-error>
        </atomic-layout-section>
        <atomic-layout-section section="pagination">
          <atomic-insight-pager></atomic-insight-pager>
        </atomic-layout-section>
      </atomic-insight-layout>`,
  ],
  play: async (context) => {
    await play(context);
  },
};
