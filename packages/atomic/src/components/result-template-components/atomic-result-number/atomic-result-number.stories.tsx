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
  }
);

export default defaultModuleExport;
export const DefaultResultNumber = exportedStory;
