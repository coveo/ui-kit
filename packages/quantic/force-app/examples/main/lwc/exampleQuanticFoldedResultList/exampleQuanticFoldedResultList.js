import {getHeadlessBundle} from 'c/quanticHeadlessLoader';
import {LightningElement, api, track} from 'lwc';
// @ts-ignore
import childTemplate from './resultTemplates/childTemplate.html';
// @ts-ignore
import parentTemplate from './resultTemplates/parentTemplate.html';

export default class ExampleQuanticFoldedResultList extends LightningElement {
  @api engineId = 'quantic-folded-result-list-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Folded Result List';
  pageDescription =
    'The QuanticFoldedResultList component is responsible for displaying query results by applying one or more result templates. This component can display query results that have a parent-child relationship with any level of nesting.';
  options = [
    {
      attribute: 'fieldsToInclude',
      label: 'Fields to include',
      description:
        'A list of fields to include in the query results, separated by commas.',
      defaultValue:
        'date,author,source,language,filetype,parents,sfknowledgearticleid',
    },
    {
      attribute: 'collectionField',
      label: 'Collection field',
      description: 'The name of the field on which to do the folding.',
      defaultValue: 'foldingcollection',
    },
    {
      attribute: 'parentField',
      label: 'Parent field',
      description:
        'The name of the field that determines whether a certain result is a top result containing other child results within a collection.',
      defaultValue: 'foldingparent',
    },
    {
      attribute: 'childField',
      label: 'Child field',
      description:
        'The name of the field that uniquely identifies a result within collection.',
      defaultValue: 'foldingchild',
    },
    {
      attribute: 'numberOfFoldedResults',
      label: 'Number of folded results',
      description:
        'The number of child results to fold under the root collection element before expansion.',
      defaultValue: 2,
    },
    {
      attribute: 'useCase',
      label: 'Use Case',
      description:
        'Define which use case to test. Possible values are: search, insight',
      defaultValue: 'search',
    },
  ];
  expectedEvents = ['quantic__registerresulttemplates'];

  handleResultTemplateRegistration(event) {
    const resultTemplatesManager = event.detail;
    const headless = getHeadlessBundle(this.engineId);
    const isChild = headless.ResultTemplatesHelpers.fieldMustMatch(
      'quantic__templateId',
      ['myChildTemplate']
    );

    resultTemplatesManager.registerTemplates(
      {
        content: childTemplate,
        conditions: [isChild],
        priority: 1,
      },
      {
        content: parentTemplate,
        conditions: [],
      }
    );
  }

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
