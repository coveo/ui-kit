import defaultResultComponentStory from 'atomic-storybook/default-result-component-story';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultPrintableUri',
  'atomic-result-printable-uri',
  {}
);

export default defaultModuleExport;
export const DefaultResultPrintableUri = exportedStory;
