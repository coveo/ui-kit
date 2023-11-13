import defaultResultComponentStory from 'atomic-storybook/default-result-component-story';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultBadge',
  'atomic-result-badge',
  {field: 'filetype'}
);

export default {...defaultModuleExport, title: 'Atomic/ResultList/ResultBadge'};
export const Default = exportedStory;
