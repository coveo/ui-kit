import defaultResultComponentStory from '../../../../.storybook/default-result-component-story';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultText',
  'atomic-result-text',
  {field: 'excerpt'}
);
export default defaultModuleExport;
export const DefaultResultText = exportedStory;
