import {ComponentErrorSelector, should} from './common-selectors';

export function logUaEvent(
  requestAlias: string,
  uaEvent: string,
  bodyData: Record<string, string | number | boolean>,
  customData?: Record<string, string | number | boolean>
) {
  return cy
    .wait(requestAlias)
    .then((interception) => {
      const analyticsBody = interception.request.body;

      Object.keys(bodyData).forEach((key: string) => {
        expect(analyticsBody).to.have.property(key, bodyData[key]);
      });

      if (customData) {
        expect(analyticsBody).to.have.property('customData');
        Object.keys(customData).forEach((key) => {
          expect(analyticsBody.customData).to.have.property(
            key,
            customData[key]
          );
        });
      }
    })
    .logDetail(`should log the "${uaEvent}" UA event`);
}

export function ComponentErrorExpectations(selector: ComponentErrorSelector) {
  return {
    displayComponentError: (display: boolean) => {
      selector
        .componentError()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the error component`);
    },

    displayErrorDialog: (display: boolean) => {
      selector
        .errorDialog()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the error dialog`);
    },
  };
}
