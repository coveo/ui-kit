import {LightningElement, api} from 'lwc';

export default class ActionFetchSuggestions extends LightningElement {
  @api engineId;

  actions;

  handleFetchSuggestions() {
    window.coveoHeadless?.[this.engineId]?.enginePromise.then((engine) => {
      this.actions = {
        ...CoveoHeadlessCaseAssist.loadDocumentSuggestionActions(engine),
      };
      engine.dispatch(this.actions.fetchDocumentSuggestions());
    });
  }
}
