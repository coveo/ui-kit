import defaultResultComponentStory from 'atomic-storybook/default-result-component-story';
import {html} from 'lit-html';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'atomic-result-number',
  {field: 'size'},
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

export default {
  ...defaultModuleExport,
  title: 'Atomic/ResultList/ResultNumber',
  id: 'atomic-result-number',
};
export const Default = exportedStory;
