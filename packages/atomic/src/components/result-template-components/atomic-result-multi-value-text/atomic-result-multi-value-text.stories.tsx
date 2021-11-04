import defaultResultComponentStory from '../../../../.storybook/default-result-component-story';
import ResultMultiValueDoc from './atomic-result-multi-value-text.mdx';

// TODO: Would benefit from KIT-1178
const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultMultiValue',
  'atomic-result-multi-value-text',
  {field: 'language'},
  ResultMultiValueDoc
);

export default defaultModuleExport;
export const DefaultMultiValueText = exportedStory;
