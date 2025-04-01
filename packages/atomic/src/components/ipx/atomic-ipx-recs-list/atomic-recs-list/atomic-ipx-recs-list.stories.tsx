import recsStory from 'atomic-storybook/recommendation/recs-story';
import {html} from 'lit';

const {defaultModuleExport, exportedStory} = recsStory(
  'atomic-ipx-recs-list',
  {},
  {
    additionalMarkup: () =>
      html` <style>
        atomic-ipx-recs-list {
          margin: 24px;
        }
      </style>`,
  }
);

export default {
  ...defaultModuleExport,
  title: 'Atomic/IPXRecsList',
  id: 'atomic-ipx-recs-list',
};
export const Default = exportedStory;
