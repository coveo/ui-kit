import defaultResultComponentStory from '../../../../.storybook/default-result-component-story';
import ResultFieldsListDoc from './atomic-result-fields-list.mdx';

// TODO requires KIT-1167 to actually be usable
const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultFieldsList',
  'atomic-result-fields-list',
  {},
  ResultFieldsListDoc
);

export default defaultModuleExport;
export const DefaultResultFieldsList = exportedStory;
