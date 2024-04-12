import defaultStory from 'atomic-storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'atomic-query-summary',
  {}
);
export default {
  ...defaultModuleExport,
  title: 'Atomic/QuerySummary',
  id: 'atomic-query-summary',
};
export const Default = exportedStory;
