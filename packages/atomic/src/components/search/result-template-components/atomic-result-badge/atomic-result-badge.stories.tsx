import defaultResultComponentStory from 'atomic-storybook/default-result-component-story';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'atomic-result-badge',
  {field: 'filetype'}
);

export default {
  ...defaultModuleExport,
  title: 'Atomic/ResultList/ResultBadge',
  id: 'atomic-result-badge',
};
export const Default = exportedStory;
