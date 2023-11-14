import defaultStory from 'atomic-storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/ResultList',
  'atomic-result-list',
  {}
);
export default {...defaultModuleExport, title: 'Atomic/ResultList'};
export const Default = exportedStory;
