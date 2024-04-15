import defaultResultComponentStory from 'atomic-storybook/default-result-component-story';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'atomic-result-icon',
  {}
);

export default {
  ...defaultModuleExport,
  title: 'Atomic/ResultList/ResultIcon',
  id: 'atomic-result-icon',
};
export const Default = exportedStory;
