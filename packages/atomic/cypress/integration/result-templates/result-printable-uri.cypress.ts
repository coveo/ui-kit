describe('Result Printable Uri Component', () => {
  describe('when not used inside a result template', () => {
    it.skip('should remove the component from the DOM');
    it.skip('should log a console error');
  });

  describe('when the "number-of-parts" prop is less than 3', () => {
    it.skip('should render an "atomic-component-error" component');
  });

  describe('when there is no "parents" property in the result object', () => {
    it.skip(
      'should render an "atomic-result-link" containing an "atomic-result-text" component displaying the "printableUri" property'
    );
  });

  describe('when there is a "parents" property in the result object', () => {
    describe('when the number of parts is lower than or equal to the "number-of-parts" prop', () => {
      it.skip('should render all parts');
    });

    describe('when the number of parts is higher than the "number-of-parts" prop', () => {
      it.skip('should add an ellipsis before the last part');

      it.skip('clicking on the ellipsis should render all parts');
    });
  });
});
