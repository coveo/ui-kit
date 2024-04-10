import defaultStory from 'atomic-storybook/default-story';
import {html} from 'lit-html';

const {defaultModuleExport, exportedStory} = defaultStory(
  'atomic-segmented-facet-scrollable',
  {},
  {
    additionalChildMarkup: () =>
      html` <atomic-segmented-facet
          field="source"
          label="Sources"
          number-of-values="10"
        ></atomic-segmented-facet>
        <atomic-segmented-facet
          field="filetype"
          label="File types"
          number-of-values="10"
        ></atomic-segmented-facet>`,
  }
);

export default {
  ...defaultModuleExport,
  title: 'Atomic/SegmentedFacet/SegmentedFacetScrollable',
  id: 'atomic-segmented-facet-scrollable',
};
export const Default = exportedStory;
