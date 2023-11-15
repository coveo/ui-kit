import defaultResultComponentStory from 'atomic-storybook/default-result-component-story';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultText',
  'atomic-result-text',
  {field: 'excerpt'}
);
export default {...defaultModuleExport, title: 'Atomic/ResultList/ResultText'};
export const Default = exportedStory;
