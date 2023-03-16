import {defaultResultComponentStory} from '@coveo/atomic-storybook';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultTimespan',
  'atomic-result-timespan',
  {field: 'ytvideoduration', unit: 's'},
  {
    engineConfig: {
      preprocessRequest: (r) => {
        const request = JSON.parse(r.body!.toString());
        request.cq = '@ytvideoduration';
        request.fieldsToInclude = ['ytvideoduration'];
        r.body = JSON.stringify(request);
        return r;
      },
    },
  }
);
export default defaultModuleExport;
export const DefaultResultText = exportedStory;
