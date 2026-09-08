import {LightningElement, api, track} from 'lwc';

export default class SearchPagePlayground extends LightningElement {
  @track config = {};
  isConfigured = false;

  /** @type {string} */
  @api engineId = 'search-page-playground';
  /** @type {string} */
  @api environment = 'prod';
  /** @type {string} */
  @api organizationId = 'searchuisamples';
  /** @type {string} */
  @api accessToken = 'xxcae0cb1a-cedf-4899-a61e-7aad0aa62a2f';
  /** @type {string} */
  @api agentId = '5fd0b5ea-d368-488e-bdeb-f6221ec0fb98';
  /** @type {string} */
  @api searchHub = 'default';
  /** @type {string} */
  @api pipeline = 'genqatest';
  /** @type {string} */
  @api analyticsMode = 'legacy';
  /** @type {string} */
  @api answerConfigurationId = '';

  pageTitle = 'Search Page Playground';
  pageDescription =
    'The Search Page Playground offers a full search environment for experimenting with search features. You can modify the search interface, change the query pipeline, and test different configurations like answer manager and search agent.';

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
        attribute: 'agentId',
        label: 'Agent ID',
        description:
          'The unique identifier of the Coveo AI agent to use for generating answers.',
        defaultValue: this.agentId,
      },
      {
        attribute: 'searchHub',
        label: 'Search Hub',
        description: 'The search hub to use for the search interface.',
        defaultValue: this.searchHub,
      },
      {
        attribute: 'pipeline',
        label: 'Pipeline',
        description: 'The query pipeline to use for the search interface.',
        defaultValue: this.pipeline,
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
