import defaultResultComponentStory from '../../../../.storybook/default-result-component-story';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultMultiValue',
  'atomic-result-multi-value-text',
  {field: 'language'}
);

export default defaultModuleExport;
export const DefaultMultiValueText = exportedStory;
