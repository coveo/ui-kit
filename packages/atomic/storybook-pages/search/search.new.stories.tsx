import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';

import '@/src/components/search/atomic-automatic-facet-generator/atomic-automatic-facet-generator.js';
import '@/src/components/search/atomic-breadbox/atomic-breadbox.js';
import '@/src/components/search/atomic-category-facet/atomic-category-facet.js';
import '@/src/components/search/atomic-color-facet/atomic-color-facet.js';
import '@/src/components/search/atomic-did-you-mean/atomic-did-you-mean.js';
import '@/src/components/search/atomic-facet/atomic-facet.js';
import '@/src/components/search/atomic-facet-manager/atomic-facet-manager.js';
import '@/src/components/search/atomic-field-condition/atomic-field-condition.js';
import '@/src/components/common/atomic-layout-section/atomic-layout-section.js';
import '@/src/components/search/atomic-no-results/atomic-no-results.js';
import '@/src/components/search/atomic-notifications/atomic-notifications.js';
import '@/src/components/search/atomic-numeric-facet/atomic-numeric-facet.js';
import '@/src/components/common/atomic-numeric-range/atomic-numeric-range.js';
import '@/src/components/search/atomic-pager/atomic-pager.js';
import '@/src/components/search/atomic-popover/atomic-popover.js';
import '@/src/components/search/atomic-query-error/atomic-query-error.js';
import '@/src/components/search/atomic-query-summary/atomic-query-summary.js';
import '@/src/components/search/atomic-quickview/atomic-quickview.js';
import '@/src/components/search/atomic-rating-facet/atomic-rating-facet.js';
import '@/src/components/search/atomic-rating-range-facet/atomic-rating-range-facet.js';
import '@/src/components/search/atomic-refine-toggle/atomic-refine-toggle.js';
import '@/src/components/search/atomic-result-badge/atomic-result-badge.js';
import '@/src/components/search/atomic-result-date/atomic-result-date.js';
import '@/src/components/search/atomic-result-fields-list/atomic-result-fields-list.js';
import '@/src/components/search/atomic-result-image/atomic-result-image.js';
import '@/src/components/search/atomic-result-link/atomic-result-link.js';
import '@/src/components/search/atomic-result-list/atomic-result-list.js';
import '@/src/components/search/atomic-result-multi-value-text/atomic-result-multi-value-text.js';
import '@/src/components/search/atomic-result-number/atomic-result-number.js';
import '@/src/components/search/atomic-result-printable-uri/atomic-result-printable-uri.js';
import '@/src/components/search/atomic-result-rating/atomic-result-rating.js';
import '@/src/components/search/atomic-result-section-actions/atomic-result-section-actions.js';
import '@/src/components/search/atomic-result-section-badges/atomic-result-section-badges.js';
import '@/src/components/search/atomic-result-section-bottom-metadata/atomic-result-section-bottom-metadata.js';
import '@/src/components/search/atomic-result-section-excerpt/atomic-result-section-excerpt.js';
import '@/src/components/search/atomic-result-section-title/atomic-result-section-title.js';
import '@/src/components/search/atomic-result-section-title-metadata/atomic-result-section-title-metadata.js';
import '@/src/components/search/atomic-result-section-visual/atomic-result-section-visual.js';
import '@/src/components/search/atomic-result-template/atomic-result-template.js';
import '@/src/components/search/atomic-result-text/atomic-result-text.js';
import '@/src/components/search/atomic-result-timespan/atomic-result-timespan.js';
import '@/src/components/search/atomic-results-per-page/atomic-results-per-page.js';
import '@/src/components/search/atomic-search-box/atomic-search-box.js';
import '@/src/components/search/atomic-search-box-query-suggestions/atomic-search-box-query-suggestions.js';
import '@/src/components/search/atomic-search-box-recent-queries/atomic-search-box-recent-queries.js';
import '@/src/components/search/atomic-search-interface/atomic-search-interface.js';
import '@/src/components/search/atomic-search-layout/atomic-search-layout.js';
import '@/src/components/search/atomic-segmented-facet/atomic-segmented-facet.js';
import '@/src/components/search/atomic-segmented-facet-scrollable/atomic-segmented-facet-scrollable.js';
import '@/src/components/search/atomic-smart-snippet/atomic-smart-snippet.js';
import '@/src/components/search/atomic-smart-snippet-suggestions/atomic-smart-snippet-suggestions.js';
import '@/src/components/search/atomic-sort-dropdown/atomic-sort-dropdown.js';
import '@/src/components/search/atomic-sort-expression/atomic-sort-expression.js';
import '@/src/components/search/atomic-text/atomic-text.js';
import '@/src/components/common/atomic-timeframe/atomic-timeframe.js';
import '@/src/components/search/atomic-timeframe-facet/atomic-timeframe-facet.js';

import {meta as metaCommon} from './common.js';
const meta: Meta = {
  ...metaCommon,
  component: 'rich-search-page',
  title: 'Search/Example Pages',
  id: 'rich-search-page',
};
export default meta;

export const Default: Story = {
  name: 'Search Page',
};
