import defaultResultComponentStory from 'atomic-storybook/default-result-component-story';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'atomic-result-html',
  {field: 'excerpt'}
);
export default {
  ...defaultModuleExport,
  title: 'Atomic/ResultList/ResultHtml',
  id: 'atomic-result-html',
};
export const Default = exportedStory;
