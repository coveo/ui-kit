import defaultResultComponentStory from 'atomic-storybook/default-result-component-story';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
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
    parentElement: function () {
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
  id: 'atomic-format-number',
};
export const Default = exportedStory;
