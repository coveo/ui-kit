import recsStory from 'atomic-storybook/recommendation/recs-story';
import {html} from 'lit-html';

const {defaultModuleExport, exportedStory} = recsStory(
  'atomic-recs-list',
  {},
  {
    additionalMarkup: () =>
      html` <style>
        atomic-recs-list {
          margin: 24px;
        }
      </style>`,
  }
);

export default {
  ...defaultModuleExport,
  title: 'Atomic/RecsList',
  id: 'atomic-recs-list',
};
export const Default = exportedStory;
