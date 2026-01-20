import {
  buildGeneratedAnswer,
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
  loadQueryActions,
  loadSearchActions,
  loadSearchAnalyticsActions,
} from 'https://static.cloud.coveo.com/headless/v3/headless.esm.js';

const coveoHeadlessRga = () => {
  const SUBMIT_BUTTON_ID = 'fetch-answer';
  const QUERY_INPUT_ID = 'query-input';
  const RESPONSE_DIV_ID = 'response';

  const searchEngine = buildSearchEngine({
    configuration: {
      ...getSampleSearchEngineConfiguration(),
      search: {
        pipeline: 'genqatest',
      },
    },
  }); // callout[Refer to <a href="#instantiating-the-engine-and-the-controller">Instantiating the engine and the controller</a> to better understand your `searchEngine` controller. The above example is not intended for production use.]

  const rgaController = buildGeneratedAnswer(searchEngine);

  const {updateQuery} = loadQueryActions(searchEngine);
  const {executeSearch} = loadSearchActions(searchEngine);
  const {logInterfaceLoad, logSearchboxSubmit} =
    loadSearchAnalyticsActions(searchEngine);

  console.log('rgaController', rgaController);
  rgaController.subscribe(() => {
    const contentDiv = document.getElementById(RESPONSE_DIV_ID);
    console.log('rgaController', rgaController.state);
    if (!rgaController.state.answer) return;
    contentDiv.innerHTML = `
        <h2>Generated Answer Component</h2>
        <p>${rgaController.state.answer}</p>
      `;
  }); // callout[This function is executed every time that the state of `rgaController` is updated.]

  document.getElementById(SUBMIT_BUTTON_ID).addEventListener('click', () => {
    const queryInput = document.getElementById(QUERY_INPUT_ID);
    const query = queryInput.value; // callout[The example configuration will only respond to the query 'how to resolve netflix connection with tivo']
    if (!query) return;
    searchEngine.dispatch(updateQuery({q: query}));
    searchEngine.dispatch(executeSearch(logSearchboxSubmit()));
  });

  searchEngine.dispatch(executeSearch(logInterfaceLoad()));
};

document.addEventListener('DOMContentLoaded', coveoHeadlessRga);
