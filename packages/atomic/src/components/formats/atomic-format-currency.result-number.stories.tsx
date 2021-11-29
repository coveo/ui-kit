import defaultResultComponentStory from '../../../.storybook/default-result-component-story';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultNumber/Format/Currency',
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
    parentElement: () => {
      const resultNumberElement = document.createElement(
        'atomic-result-number'
      );
      resultNumberElement.setAttribute('field', 'sncost');
      return resultNumberElement;
    },
  }
);

export default defaultModuleExport;
export const DefaultFormatCurrency = exportedStory;
