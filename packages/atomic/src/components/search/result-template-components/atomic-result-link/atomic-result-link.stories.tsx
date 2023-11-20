import defaultResultComponentStory from 'atomic-storybook/default-result-component-story';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultLink',
  'atomic-result-link',
  {}
);

export default {...defaultModuleExport, title: 'Atomic/ResultList/ResultLink'};
export const Default = exportedStory;
