import {html} from 'lit-html';
import recsStory from '../../../../.storybook/recommendation/recs-story';

const {defaultModuleExport, exportedStory} = recsStory(
  'Atomic/RecsList',
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

export default defaultModuleExport;
export const DefaultRecsList = exportedStory;
