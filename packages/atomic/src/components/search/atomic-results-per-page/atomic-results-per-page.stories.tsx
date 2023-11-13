import defaultStory from 'atomic-storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/ResultsPerPage',
  'atomic-results-per-page',
  {}
);

export default {...defaultModuleExport, title: 'Atomic/ResultsPerPage'};
export const Default = exportedStory;
