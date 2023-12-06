import defaultResultComponentStory from 'atomic-storybook/default-result-component-story';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultHtml',
  'atomic-result-html',
  {field: 'excerpt'}
);
export default {...defaultModuleExport, title: 'Atomic/ResultList/ResultHtml'};
export const Default = exportedStory;
