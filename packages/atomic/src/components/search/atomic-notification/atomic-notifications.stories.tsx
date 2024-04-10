import defaultStory from 'atomic-storybook/default-story';

const id = 'atomic-notifications';
const {defaultModuleExport, exportedStory} = defaultStory(
  id,
  {},
  {
    engineConfig: {
      search: {
        preprocessSearchResponseMiddleware: (response) => {
          response.body.triggers = [
            {
              type: 'notify',
              content:
                'This is a demo notification. It contains text that may span over a different number of lines depending on your screen width. Notifications are returned by the Coveo Search API.',
            },
            {
              type: 'notify',
              content:
                'This is a different notification. Any amount of notifications can be returned by the Coveo Search API.',
            },
          ];
          return response;
        },
      },
    },
  }
);

export default {...defaultModuleExport, title: 'Atomic/Notifications', id};
export const Default = exportedStory;
