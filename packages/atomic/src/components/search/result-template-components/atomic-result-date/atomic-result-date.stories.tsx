import defaultResultComponentStory from 'atomic-storybook/default-result-component-story';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultDate',
  'atomic-result-date',
  {}
);
export default {...defaultModuleExport, title: 'Atomic/ResultList/ResultDate'};
export const Default = exportedStory;
