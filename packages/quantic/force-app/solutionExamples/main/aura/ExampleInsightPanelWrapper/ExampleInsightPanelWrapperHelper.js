({
  /**
   * Executes a quick action using the QuickActionsAPI with parameters coming from
   * the event details.
   * The `actionName` and `targetFields` are the parameters needed to specify which
   * action will be executed and which parameter will be set on this action.
   * On success it will resolve a promise gotten from the event;
   * On error it will reject the promise with the error information.
   * https://developer.salesforce.com/docs/component-library/bundle/lightning:quickActionAPI/documentation
   * @param {Aura.Component} component
   * @param {Event} event Custom Event.
   */
  executeQuickActionFromEvent: function (component, event) {
    const quickActionsApi = component.find('quickActionAPI');
    const targetFields = event.getParam('targetFields');
    const actionName = event.getParam('actionName');
    const resultPromiseResolve = event.getParam('resultPromiseResolve');
    const resultPromiseReject = event.getParam('resultPromiseReject');
    if (quickActionsApi && targetFields && actionName) {
      quickActionsApi
        .setActionFieldValues({
          actionName,
          targetFields,
        })
        .then((data) => {
          if (resultPromiseResolve) {
            resultPromiseResolve(data);
          }
        })
        .catch((error) => {
          if (resultPromiseReject) {
            resultPromiseReject(error);
          }
        });
    }
  },
});
