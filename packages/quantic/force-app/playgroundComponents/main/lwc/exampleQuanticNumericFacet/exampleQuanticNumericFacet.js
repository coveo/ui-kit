import LOCALE from '@salesforce/i18n/locale';
import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticNumericFacet extends LightningElement {
  @api engineId = 'quantic-numeric-facet-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Numeric Facet';
  pageDescription =
    'The Quantic Numeric Facet displays facet values as numeric ranges.';
  options = [
    {
      attribute: 'field',
      label: 'Field',
      description: 'The name of the field to display as a facet.',
      defaultValue: 'ytlikecount',
    },
    {
      attribute: 'label',
      label: 'Label',
      description: 'The label to use as the facet title.',
      defaultValue: 'Youtube Likes',
    },
    {
      attribute: 'numberOfValues',
      label: 'Number of values',
      description: 'The number of values displayed by the facet.',
      defaultValue: 8,
    },
    {
      attribute: 'displayValuesAs',
      label: 'Display values as',
      description:
        'Whether to display the facet values in "checkbox" mode (multiple selection) or "link" mode (single selection).',
      defaultValue: 'checkbox',
    },
    {
      attribute: 'sortCriteria',
      label: 'Sort criteria',
      description:
        'The sorting applied to the facet. Possible values are: ascending, descending',
      defaultValue: 'ascending',
    },
    {
      attribute: 'rangeAlgorithm',
      label: 'Range algorithm',
      description:
        'The algorithm used for generating the ranges of this facet when they aren’t manually defined. Possible values are: even, equiprobable',
      defaultValue: 'equiprobable',
    },
    {
      attribute: 'withInput',
      label: 'With input',
      description:
        'Whether this facet should contain an input allowing users to set custom ranges.',
      defaultValue: null,
    },
    {
      attribute: 'isCollapsed',
      label: 'Is Collapsed',
      description: 'Whether to collapse the facet.',
      defaultValue: false,
    },
    {
      attribute: 'useCase',
      label: 'Use Case',
      description:
        'Define which use case to test. Possible values are: search, insight',
      defaultValue: 'search',
    },
  ];
  formattingFunction = (item) =>
    `${new Intl.NumberFormat(LOCALE).format(
      item.start
    )} - ${new Intl.NumberFormat(LOCALE).format(item.end)}`;

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
