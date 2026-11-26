describe('deprecationUtils', () => {
  let warnDeprecatedPropertyOnce;
  let warnSpy;

  beforeEach(() => {
    jest.isolateModules(() => {
      ({warnDeprecatedPropertyOnce} = require('../deprecationUtils'));
    });
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  describe('warnDeprecatedPropertyOnce', () => {
    it('should warn with the component, the deprecated property and its replacement', () => {
      warnDeprecatedPropertyOnce('c-quantic-foo', 'oldName', 'newName');

      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(
        'The "oldName" property of c-quantic-foo is deprecated and will be removed in the next major version. Use "newName" instead.'
      );
    });

    it('should warn only once for the same component and property', () => {
      warnDeprecatedPropertyOnce('c-quantic-foo', 'oldName', 'newName');
      warnDeprecatedPropertyOnce('c-quantic-foo', 'oldName', 'newName');

      expect(warnSpy).toHaveBeenCalledTimes(1);
    });

    it('should warn separately for different components or properties', () => {
      warnDeprecatedPropertyOnce('c-quantic-foo', 'oldName', 'newName');
      warnDeprecatedPropertyOnce('c-quantic-bar', 'oldName', 'newName');
      warnDeprecatedPropertyOnce('c-quantic-foo', 'otherName', 'newName');

      expect(warnSpy).toHaveBeenCalledTimes(3);
    });
  });
});
