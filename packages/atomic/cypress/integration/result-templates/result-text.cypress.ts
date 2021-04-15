describe('Result Text Component', () => {
  describe('when not used inside a result template', () => {
    it.skip('should remove the component from the DOM');
    it.skip('should log a console error');
  });

  describe('when the field does not exist for the result but the "default" prop is set', () => {
    it.skip('should render an "atomic-text" component with the default value');
  });

  describe('when the field does not exist for the result and the "default" prop is not set', () => {
    it.skip('should remove the component from the DOM');
  });

  describe('when the field value is not a string', () => {
    it.skip('should remove the component from the DOM');
  });

  describe('when the field value exists & is a string', () => {
    describe('when the "shouldHighlight" prop is true and when highlights are available for the field', () => {
      it.skip('should render the highlighted text');
    });

    describe('when the "shouldHighlight" prop is false', () => {
      // TODO: render it inside a localized atomic-text component
      it.skip('should render text value directly');
    });

    describe('when when highlights are unavailable for the field', () => {
      // TODO: render it inside a localized atomic-text component
      it.skip('should render text value directly');
    });
  });
});
