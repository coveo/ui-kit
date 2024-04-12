import defaultResultComponentStory from 'atomic-storybook/default-result-component-story';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'atomic-format-currency',
  {
    currency: 'USD',
  },
  {
    engineConfig: {
      preprocessRequest: (r) => {
        const parsed = JSON.parse(r.body as string);
        parsed.aq = '@sncost';
        parsed.fieldsToInclude = [...parsed.fieldsToInclude, 'sncost'];
        r.body = JSON.stringify(parsed);
        return r;
      },
    },
    parentElement: function () {
      const resultNumberElement = document.createElement(
        'atomic-result-number'
      );
      resultNumberElement.setAttribute('field', 'sncost');
      return resultNumberElement;
    },
  }
);

export default {
  ...defaultModuleExport,
  title: 'Atomic/ResultList/ResultNumber/Format/Currency',
  id: 'atomic-format-currency',
};
export const Default = exportedStory;
