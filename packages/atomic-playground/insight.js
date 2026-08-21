import {loadCaseContextActions} from '@coveo/headless/insight';
import './load-atomic.js';
import './nav.js';
import {insightCredentials} from './sample-credentials.js';

const SAMPLE_CASE_ID = '1234';

await customElements.whenDefined('atomic-insight-interface');
await customElements.whenDefined('atomic-insight-layout');

const insightInterface = document.querySelector('atomic-insight-interface');
await insightInterface.initialize(insightCredentials);

const {setCaseId} = loadCaseContextActions(insightInterface.engine);
insightInterface.engine.dispatch(setCaseId(SAMPLE_CASE_ID));
insightInterface.executeFirstSearch();

await customElements.whenDefined('atomic-insight-full-search-button');
document.querySelector('atomic-insight-full-search-button').clickCallback = () => {
  console.log('Full search button clicked');
};

const widgetElements = [insightInterface, document.querySelector('atomic-insight-layout')];
let isWidgetView = true;

const applyWidgetView = () => {
  for (const element of widgetElements) {
    element.setAttribute('widget', String(isWidgetView));
  }
};

document.getElementById('widget-view').addEventListener('click', () => {
  isWidgetView = !isWidgetView;
  applyWidgetView();
});

applyWidgetView();

document.addEventListener('atomicInsightResultActionClicked', (event) => {
  console.log('Result action clicked', event.detail);
});

document.addEventListener('atomic/insight/attachToCase/attach', (event) => {
  console.log('attach', event.detail);
  event.detail.controller.attach();
});

document.addEventListener('atomic/insight/attachToCase/detach', (event) => {
  console.log('detach', event.detail);
  event.detail.controller.detach();
});
