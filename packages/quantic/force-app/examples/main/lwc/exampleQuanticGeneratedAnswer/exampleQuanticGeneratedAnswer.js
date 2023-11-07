import {LightningElement, api, track} from 'lwc';

export default class ExampleQuanticGeneratedAnswer extends LightningElement {
  @api engineId = 'quantic-generated-answer-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Generated Answer';
  pageDescription =
    'The QuanticGeneratedAnswer component automatically generates an answer using Coveo machine learning models to answer the query executed by the user.';
  options = [
    {
      attribute: 'answerStyle',
      label: 'Answer style',
      description: 'The answer style to apply when the component first loads.',
      defaultValue: 'default',
    },
    {
      attribute: 'multilineFooter',
      label: 'Multiline footer',
      description:
        'Indicates whether footer sections should be displayed on multiple lines.',
      defaultValue: false,
    },
  ];

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
