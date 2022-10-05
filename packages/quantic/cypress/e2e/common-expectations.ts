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
