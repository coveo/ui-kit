import {parameters} from '@coveo/atomic/storybookUtils/common-meta-parameters';
import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import {wrapInSearchInterface} from '@coveo/atomic/storybookUtils/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit/static-html.js';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-tab-manager',
  title: 'Atomic/Tabs',
  id: 'atomic-tab-manager',

  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
  args: {
    'slots-default': `
      <atomic-tab name="all" label="All" tab></atomic-tab>
      <atomic-tab name="article" label="Articles"></atomic-tab>
      <atomic-tab name="documentation" label="Documentation"></atomic-tab>
    `,
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-tab-manager',
  decorators: [
    (story) => html`
      ${story()}
      <div style="display: flex; justify-content: flex-start;">
        <atomic-facet field="objecttype" label="Object type"></atomic-facet>
        <atomic-facet
          aria-label="included-facet"
          tabs-included='["article"]'
          field="filetype"
          label="File type"
        ></atomic-facet>
        <atomic-facet
          aria-label="excluded-facet"
          tabs-excluded='["article"]'
          field="source"
          label="Source"
        ></atomic-facet>
      </div>
      <div style="display: flex; justify-content: flex-start;">
        <atomic-category-facet
          aria-label="included-facet"
          tabs-included='["article"]'
          field="geographicalhierarchy"
          label="World Atlas"
          with-search
        ></atomic-category-facet>
        <atomic-category-facet
          aria-label="excluded-facet"
          tabs-excluded='["article"]'
          field="geographicalhierarchy"
          label="World Atlas"
        ></atomic-category-facet>
        <atomic-color-facet
          aria-label="included-facet"
          tabs-included='["article"]'
          field="filetype"
          label="Files"
          number-of-values="6"
          sort-criteria="occurrences"
        ></atomic-color-facet>
        <atomic-color-facet
          aria-label="excluded-facet"
          tabs-excluded='["article"]'
          field="filetype"
          label="Files"
          number-of-values="6"
          sort-criteria="occurrences"
        ></atomic-color-facet>
      </div>
      <div style="display: flex; justify-content: flex-start;">
        <atomic-rating-facet
          aria-label="included-facet"
          tabs-included='["article"]'
          field="snrating"
          label="Rating"
          number-of-intervals="5"
        ></atomic-rating-facet>
        <atomic-rating-facet
          aria-label="excluded-facet"
          tabs-excluded='["article"]'
          field="snrating"
          label="Rating"
          number-of-intervals="5"
        ></atomic-rating-facet>
        <atomic-rating-range-facet
          aria-label="included-facet"
          tabs-included='["article"]'
          facet-id="snrating_range"
          field="snrating"
          label="Rating Range (auto)"
          number-of-intervals="5"
        ></atomic-rating-range-facet>
        <atomic-rating-range-facet
          aria-label="excluded-facet"
          tabs-excluded='["article"]'
          facet-id="snrating_range_2"
          field="snrating"
          label="Rating Range (auto)"
          number-of-intervals="5"
        ></atomic-rating-range-facet>
      </div>
      <div style="display: flex; justify-content: flex-start; padding:50px;">
        <atomic-segmented-facet-scrollable>
          <atomic-segmented-facet
            aria-label="included-facet"
            tabs-included='["article"]'
            field="inat_kingdom"
            label="Kingdom"
          ></atomic-segmented-facet>
        </atomic-segmented-facet-scrollable>
        <atomic-segmented-facet-scrollable>
          <atomic-segmented-facet
            aria-label="excluded-facet"
            tabs-excluded='["article"]'
            field="inat_kingdom"
            label="Kingdom"
          ></atomic-segmented-facet>
        </atomic-segmented-facet-scrollable>
      </div>
      <div style="display: flex; justify-content: flex-start;">
        <atomic-timeframe-facet
          aria-label="included-facet"
          tabs-included='["article"]'
          label="Timeframe"
          with-date-picker
        >
          <atomic-timeframe unit="hour"></atomic-timeframe>
          <atomic-timeframe unit="day"></atomic-timeframe>
          <atomic-timeframe unit="week"></atomic-timeframe>
          <atomic-timeframe unit="month"></atomic-timeframe>
          <atomic-timeframe unit="quarter"></atomic-timeframe>
          <atomic-timeframe unit="year"></atomic-timeframe>
          <atomic-timeframe
            unit="year"
            amount="10"
            period="next"
          ></atomic-timeframe
        ></atomic-timeframe-facet>
        <atomic-timeframe-facet
          aria-label="excluded-facet"
          tabs-excluded='["article"]'
          label="Timeframe"
          with-date-picker
        >
          <atomic-timeframe unit="hour"></atomic-timeframe>
          <atomic-timeframe unit="day"></atomic-timeframe>
          <atomic-timeframe unit="week"></atomic-timeframe>
          <atomic-timeframe unit="month"></atomic-timeframe>
          <atomic-timeframe unit="quarter"></atomic-timeframe>
          <atomic-timeframe unit="year"></atomic-timeframe>
          <atomic-timeframe
            unit="year"
            amount="10"
            period="next"
          ></atomic-timeframe
        ></atomic-timeframe-facet>
      </div>
    `,
  ],
};
