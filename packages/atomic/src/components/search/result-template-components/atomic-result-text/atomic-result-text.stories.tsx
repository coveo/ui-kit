import defaultResultComponentStory from 'atomic-storybook/default-result-component-story';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'atomic-result-text',
  {field: 'excerpt'}
);
export default {
  ...defaultModuleExport,
  title: 'Atomic/ResultList/ResultText',
  id: 'atomic-result-text',
};
export const Default = exportedStory;
