import defaultStory from 'atomic-storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/Pager',
  'atomic-pager',
  {}
);

export default {...defaultModuleExport, title: 'Atomic/Pager'};
export const Default = exportedStory;
