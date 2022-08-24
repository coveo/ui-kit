import {html} from 'lit-html';
import defaultStory from '../../../../../.storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/SegmentedFacet/SegmentedFacetScrollable',
  'atomic-segmented-facet-scrollable',
  {},
  {
    additionalChildMarkup: () => html` <atomic-segmented-facet
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

export default defaultModuleExport;
export const DefaultSegmentedFacetScrollable = exportedStory;
