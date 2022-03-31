import defaultResultComponentStory from '../../../../.storybook/default-result-component-story';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultDate',
  'atomic-result-date',
  {}
);
export default defaultModuleExport;
export const DefaultResultDate = exportedStory;
