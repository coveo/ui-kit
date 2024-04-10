import defaultStory from 'atomic-storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'atomic-query-error',
  {},
  {
    engineConfig: {
      accessToken: 'invalidtoken',
    },
  }
);

export default {
  ...defaultModuleExport,
  title: 'Atomic/QueryError',
  id: 'atomic-query-error',
};
export const Default = exportedStory;
