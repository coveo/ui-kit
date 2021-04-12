describe('Result Icon Component', () => {
  describe('when not used inside a result template', () => {
    it.skip('should remove the component from the DOM');
    it.skip('should log a console error');
  });

  describe('when the "icon" prop is defined', () => {
    it.skip('should render the defined icon');
  });

  describe('when the "icon" prop is not defined', () => {
    describe('when the "filetype" field value matches an icon', () => {
      it.skip("should render the filetype's value icon");
    });

    describe('when the "objecttype" field value matches an icon', () => {
      it.skip("should render the objecttype's value icon");
    });

    describe('when the neither the "objecttype" nor "filetype" field value matches an icon', () => {
      it.skip('should render the "custom" icon');
    });
  });
});
