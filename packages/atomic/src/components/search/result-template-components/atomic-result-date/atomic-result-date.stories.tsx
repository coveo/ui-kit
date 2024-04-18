import defaultResultComponentStory from 'atomic-storybook/default-result-component-story';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'atomic-result-date',
  {}
);
export default {
  ...defaultModuleExport,
  title: 'Atomic/ResultList/ResultDate',
  id: 'atomic-result-date',
};
export const Default = exportedStory;
