import defaultStory from 'atomic-storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory('atomic-pager', {});

export default {
  ...defaultModuleExport,
  title: 'Atomic/Pager',
  id: 'atomic-pager',
};
export const Default = exportedStory;
