import defaultStory from 'atomic-storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/QueryError',
  'atomic-query-error',
  {},
  {
    engineConfig: {
      accessToken: 'invalidtoken',
    },
  }
);

export default defaultModuleExport;
export const DefaultQueryError = exportedStory;
