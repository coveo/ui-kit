import defaultStory from '../../../../.storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/Notification',
  'atomic-notification',
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
          ];
          return response;
        },
      },
    },
  }
);

export default defaultModuleExport;
export const DefaultNotification = exportedStory;
