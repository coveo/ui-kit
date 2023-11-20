import defaultStory from 'atomic-storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/SegmentedFacet',
  'atomic-segmented-facet',
  {
    field: 'source',
    label: 'Sources',
  }
);

export default {...defaultModuleExport, title: 'Atomic/SegmentedFacet'};
export const Default = exportedStory;
