import defaultStory from 'atomic-storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
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

export default {
  ...defaultModuleExport,
  title: 'Atomic/NoResults',
};
export const Default = exportedStory;
