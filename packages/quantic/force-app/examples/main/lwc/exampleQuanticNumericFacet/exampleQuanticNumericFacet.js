import {api, LightningElement, track} from 'lwc';
import LOCALE from '@salesforce/i18n/locale';

export default class ExampleQuanticNumericFacet extends LightningElement {
    @api engineId = 'quantic-numeric-facet-engine';
    @track config = {};
    isConfigured = false;

    pageTitle = 'Quantic Numeric Facet';
    pageDescription = 'The Quantic Numeric Facet displays facet values as numeric ranges.'
    options = [
        {
            attribute: 'field',
            label: 'Field',
            description: 'The name of the field to display as a facet.',
            defaultValue: 'ytlikecount'
        },
        {
            attribute: 'label',
            label: 'Label',
            description: 'The label to use as the facet title.',
            defaultValue: 'Youtube Likes'
        },
        {
            attribute: 'numberOfValues',
            label: 'Number of values',
            description: 'The number of values displayed by the facet.',
            defaultValue: 8
        },
        {
            attribute: 'sortCriteria',
            label: 'Sort criteria',
            description: 'The sorting applied to the facet. Possible values are: ascending, descending',
            defaultValue: 'ascending'
        },
        {
            attribute: 'rangeAlgorithm',
            label: 'Range algorithm',
            description: 'The algorithm used for generating the ranges of this facet when they aren’t manually defined. Possible values are: even, equiprobable',
            defaultValue: 'equiprobable'
        },
        {
            attribute: 'withInput',
            label: 'With input',
            description: 'Whether this facet should contain an input allowing users to set custom ranges.',
            defaultValue: null
        },
        {
            attribute: 'isCollapsed',
            label: 'Is Collapsed',
            description: 'Whether to collapse the facet.',
            defaultValue: false
        }
    ]
    formattingFunction = (item) => `${new Intl.NumberFormat(LOCALE).format(
        item.start
      )} - ${new Intl.NumberFormat(LOCALE).format(
        item.end
    )}`;

    handleTryItNow(evt) {
        this.config = evt.detail;
        this.isConfigured = true;
    }
}