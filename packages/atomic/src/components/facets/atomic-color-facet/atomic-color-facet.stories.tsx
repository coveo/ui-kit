import {html} from 'lit-html';
import defaultStory from '../../../../.storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/ColorFacet',
  'atomic-color-facet',
  {field: 'filetype', numberOfValues: '9'},
  {
    additionalMarkup: () => html`<style>
      atomic-color-facet {
        max-width: 500px;
        margin: auto;
      }

      atomic-color-facet::part(value-doc) {
        background-image: url('atomic/assets/document.svg');
        background-position: center;
        background-size: contain;
        background-repeat: no-repeat;
        background-color: rgb(117, 221, 221);
      }

      atomic-color-facet::part(value-lithiumuser) {
        background-image: url('atomic/assets/folder.svg');
        background-position: center;
        background-size: contain;
        background-repeat: no-repeat;
        background-color: rgb(132, 199, 208);
      }

      atomic-color-facet::part(value-SalesforceItem) {
        background-image: url('atomic/assets/record.svg');
        background-position: center;
        background-size: contain;
        background-repeat: no-repeat;
        background-color: rgb(146, 151, 196);
      }

      atomic-color-facet::part(value-lithiummessage) {
        background-image: url('atomic/assets/knowledge.svg');
        background-position: center;
        background-size: contain;
        background-repeat: no-repeat;
        background-color: rgb(147, 104, 183);
      }

      atomic-color-facet::part(value-ppt) {
        background-image: url('atomic/assets/ppt.svg');
        background-position: center;
        background-size: contain;
        background-repeat: no-repeat;
        background-color: transparent;
      }

      atomic-color-facet::part(value-pdf) {
        background-image: url('atomic/assets/pdf.svg');
        background-position: center;
        background-size: contain;
        background-repeat: no-repeat;
        background-color: transparent;
      }

      atomic-color-facet::part(value-pdf) {
        background-image: url('atomic/assets/pdf.svg');
        background-position: center;
        background-size: contain;
        background-repeat: no-repeat;
        background-color: transparent;
      }

      atomic-color-facet::part(value-rssitem) {
        background-image: url('atomic/assets/feed.svg');
        background-position: center;
        background-size: contain;
        background-repeat: no-repeat;
        background-color: rgb(170, 62, 152);
      }

      atomic-color-facet::part(value-txt) {
        background-image: url('atomic/assets/txt.svg');
        background-position: center;
        background-size: contain;
        background-repeat: no-repeat;
        background-color: transparent;
      }

      atomic-color-facet::part(value-YouTubeVideo) {
        background-image: url('atomic/assets/video.svg');
        background-position: center;
        background-size: contain;
        background-repeat: no-repeat;
        background-color: rgb(122, 231, 199);
      }
    </style>`,
  }
);

export default defaultModuleExport;
export const DefaultColorFacet = exportedStory;
