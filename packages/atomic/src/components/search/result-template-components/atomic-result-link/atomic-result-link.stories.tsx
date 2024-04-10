import defaultResultComponentStory from 'atomic-storybook/default-result-component-story';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'atomic-result-link',
  {}
);

export default {
  ...defaultModuleExport,
  title: 'Atomic/ResultList/ResultLink',
  id: 'atomic-result-link',
};
export const Default = exportedStory;
