import defaultStory from 'atomic-storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'atomic-result-list',
  {}
);
export default {
  ...defaultModuleExport,
  title: 'Atomic/ResultList',
  id: 'atomic-result-list',
};
export const Default = exportedStory;
