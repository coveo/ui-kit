import defaultStory from '../../../../../.storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/SegmentedFacet',
  'atomic-segmented-facet',
  {
    field: 'source',
    label: 'Sources',
  }
);

export default defaultModuleExport;
export const DefaultSegmentedFacet = exportedStory;
