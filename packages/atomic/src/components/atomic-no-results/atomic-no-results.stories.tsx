import defaultStory from '../../../.storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/NoResults',
  'atomic-no-results',
  {},
  {
    engineConfig: {
      search: {
        preprocessSearchResponseMiddleware: (r) => {
          r.body.results = [];
          return r;
        },
      },
    },
  }
);

export default defaultModuleExport;
export const DefaultNoResults = exportedStory;
