import defaultResultComponentStory from 'atomic-storybook/default-result-component-story';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultNumber/Format/Number',
  'atomic-format-number',
  {},
  {
    engineConfig: {
      preprocessRequest: (r) => {
        const parsed = JSON.parse(r.body as string);
        parsed.fieldsToInclude = [...parsed.fieldsToInclude, 'size'];
        r.body = JSON.stringify(parsed);
        return r;
      },
    },
    parentElement: () => {
      const resultNumberElement = document.createElement(
        'atomic-result-number'
      );
      resultNumberElement.setAttribute('field', 'size');
      return resultNumberElement;
    },
  }
);

export default {
  ...defaultModuleExport,
  title: 'Atomic/ResultList/ResultNumber/Format/Number',
};
export const DefaultFormatNumber = exportedStory;
