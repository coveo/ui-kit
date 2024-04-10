import defaultStory from 'atomic-storybook/default-story';

const id = 'atomic-load-more-results';
const {defaultModuleExport, exportedStory} = defaultStory(id, {});

export default {...defaultModuleExport, title: 'Atomic/LoadMoreResults'};
export const Default = exportedStory;
