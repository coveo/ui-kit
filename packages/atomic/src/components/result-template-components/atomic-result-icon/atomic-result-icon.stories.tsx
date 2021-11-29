import defaultResultComponentStory from '../../../../.storybook/default-result-component-story';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultIcon',
  'atomic-result-icon',
  {}
);

export default defaultModuleExport;
export const DefaultResultIcon = exportedStory;
