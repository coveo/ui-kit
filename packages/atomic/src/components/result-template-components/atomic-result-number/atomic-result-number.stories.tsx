import {html} from 'lit-html';
import defaultResultComponentStory from '../../../../.storybook/default-result-component-story';
import ResultNumberDoc from './atomic-result-number.mdx';

// TODO: Would benefit a lot from KIT-1167
const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultNumber',
  'atomic-result-number',
  {field: 'size'},
  ResultNumberDoc,
  {
    engineConfig: {
      preprocessRequest: (r) => {
        const parsed = JSON.parse(r.body as string);
        parsed.fieldsToInclude = [...parsed.fieldsToInclude, 'size'];
        r.body = JSON.stringify(parsed);
        return r;
      },
    },
    additionalChildMarkup: () => html`
      <span style="font-weight: bold; margin-right: 0.25rem;">File size:</span>
      <atomic-format-unit unit="byte" unit-display="long"></atomic-format-unit>
    `,
  }
);

export default defaultModuleExport;
export const DefaultResultNumber = exportedStory;
