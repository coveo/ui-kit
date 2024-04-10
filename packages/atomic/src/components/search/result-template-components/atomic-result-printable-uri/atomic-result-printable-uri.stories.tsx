import defaultResultComponentStory from 'atomic-storybook/default-result-component-story';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'atomic-result-printable-uri',
  {}
);

export default {
  ...defaultModuleExport,
  title: 'Atomic/ResultList/ResultPrintableUri',
  id: 'atomic-result-printable-uri',
};
export const Default = exportedStory;
