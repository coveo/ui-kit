import defaultResultComponentStory from '../../../../.storybook/default-result-component-story';
import ResultPrintableUriDoc from './atomic-result-printable-uri.mdx';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultPrintableUri',
  'atomic-result-printable-uri',
  {},
  ResultPrintableUriDoc
);

export default defaultModuleExport;
export const DefaultResultPrintableUri = exportedStory;
