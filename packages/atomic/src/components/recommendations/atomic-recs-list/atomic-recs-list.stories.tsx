import recsStory from 'atomic-storybook/recommendation/recs-story';
import {html} from 'lit-html';

const id = 'atomic-recs-list';
const {defaultModuleExport, exportedStory} = recsStory(
  id,
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

export default {...defaultModuleExport, title: 'Atomic/RecsList'};
export const Default = exportedStory;
