import {LightningElement, api, track} from 'lwc';

export default class ExampleInsightSearchAgent extends LightningElement {
  @track config = {};
  isConfigured = false;

  /** @type {string} */
  @api engineId = 'example-insight-search-agent';
  /** @type {string} */
  @api environment = 'prod';
  /** @type {string} */
  @api organizationId = 'searchuisamples';
  /** @type {string} */
  @api accessToken = 'xx564559b1-0045-48e1-953c-3addd1ee4457';
  /** @type {string} */
  @api insightId = '142be676-703c-445f-b2d3-fcc7c0a3ded8';
  /** @type {string} */
  @api agentId = '5fd0b5ea-d368-488e-bdeb-f6221ec0fb98';
  /** @type {string} */
  @api analyticsMode = 'legacy';
  /** @type {string} */
  @api answerConfigurationId = '';

  pageTitle = 'Insight Search Agent Example';
  pageDescription =
    'The Insight Search Agent example demonstrates an insight panel interface with generated answers powered by a Coveo AI agent.';

  get options() {
    return [
      {
        attribute: 'environment',
        label: 'Environment',
        description:
          'The Coveo environment to use (e.g., prod, hipaa, staging, dev).',
        defaultValue: this.environment,
      },
      {
        attribute: 'organizationId',
        label: 'Organization ID',
        description: 'The unique identifier of the Coveo organization.',
        defaultValue: this.organizationId,
      },
      {
        attribute: 'accessToken',
        label: 'Access Token',
        description:
          'The access token used to authenticate with the Coveo API.',
        defaultValue: this.accessToken,
      },
      {
        attribute: 'insightId',
        label: 'Insight ID',
        description:
          'The ID of the Insight Panel configuration to use.',
        defaultValue: this.insightId,
      },
      {
        attribute: 'agentId',
        label: 'Agent ID',
        description:
          'The unique identifier of the Coveo AI agent to use for generating answers.',
        defaultValue: this.agentId,
      },
      {
        attribute: 'analyticsMode',
        label: 'Analytics Mode',
        description: 'The analytics mode to use (legacy or next).',
        defaultValue: this.analyticsMode,
      },
      {
        attribute: 'answerConfigurationId',
        label: 'Answer Configuration ID',
        description:
          'The unique identifier of the answer configuration. Mutually exclusive with agentId. If both are provided, agentId will be used.',
        defaultValue: this.answerConfigurationId,
      },
    ];
  }

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
