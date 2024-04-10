import defaultStory from 'atomic-storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'atomic-results-per-page',
  {}
);

export default {
  ...defaultModuleExport,
  title: 'Atomic/ResultsPerPage',
  id: 'atomic-results-per-page',
};
export const Default = exportedStory;
