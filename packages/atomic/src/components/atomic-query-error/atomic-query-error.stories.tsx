import defaultStory from '../../../.storybook/default-story';
import QueryErrorDoc from './atomic-query-error.mdx';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/QueryError',
  'atomic-query-error',
  {},
  QueryErrorDoc,
  {
    engineConfig: {
      accessToken: 'invalidtoken',
    },
  }
);

export default defaultModuleExport;
export const DefaultQueryError = exportedStory;
