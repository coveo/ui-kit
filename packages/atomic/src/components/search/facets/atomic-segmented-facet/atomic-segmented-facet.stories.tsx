import defaultStory from 'atomic-storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'atomic-segmented-facet',
  {
    field: 'source',
    label: 'Sources',
  }
);

export default {
  ...defaultModuleExport,
  title: 'Atomic/SegmentedFacet',
  id: 'atomic-segmented-facet',
};
export const Default = exportedStory;
