import defaultStory from 'atomic-storybook/default-story';

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

export const DefaultNoResults = exportedStory;
export default {
  ...defaultModuleExport,
  title: 'Atomic/NoResults',
  id: 'atomic-no-results',
};
