import {buildMockSpotlightContent} from '../../../test/mock-spotlight-content.js';
import {SpotlightContentTemplatesHelpers} from './spotlight-content-templates-helpers.js';

describe('SpotlightContentTemplatesHelpers', () => {
  const spotlightContent = buildMockSpotlightContent({
    name: 'Summer Sale',
    description: undefined,
  });

  describe('#getSpotlightContentProperty', () => {
    it('returns the value of a defined property', () => {
      expect(
        SpotlightContentTemplatesHelpers.getSpotlightContentProperty(spotlightContent, 'name')
      ).toBe('Summer Sale');
    });

    it('returns null for an undefined property', () => {
      expect(
        SpotlightContentTemplatesHelpers.getSpotlightContentProperty(
          spotlightContent,
          'description'
        )
      ).toBeNull();
    });
  });

  describe('#fieldsMustBeDefined', () => {
    it('returns true when every field is defined', () => {
      expect(
        SpotlightContentTemplatesHelpers.fieldsMustBeDefined(['name', 'id'])(spotlightContent)
      ).toBe(true);
    });

    it('returns false when a field is not defined', () => {
      expect(
        SpotlightContentTemplatesHelpers.fieldsMustBeDefined(['name', 'description'])(
          spotlightContent
        )
      ).toBe(false);
    });
  });

  describe('#fieldsMustNotBeDefined', () => {
    it('returns true when no field is defined', () => {
      expect(
        SpotlightContentTemplatesHelpers.fieldsMustNotBeDefined(['description'])(spotlightContent)
      ).toBe(true);
    });

    it('returns false when a field is defined', () => {
      expect(
        SpotlightContentTemplatesHelpers.fieldsMustNotBeDefined(['name'])(spotlightContent)
      ).toBe(false);
    });
  });

  describe('#fieldMustMatch', () => {
    it('returns true when the value matches, ignoring case', () => {
      expect(
        SpotlightContentTemplatesHelpers.fieldMustMatch('name', ['summer sale'])(spotlightContent)
      ).toBe(true);
    });

    it('returns false when the value does not match', () => {
      expect(
        SpotlightContentTemplatesHelpers.fieldMustMatch('name', ['winter'])(spotlightContent)
      ).toBe(false);
    });
  });

  describe('#fieldMustNotMatch', () => {
    it('returns true when the value does not match', () => {
      expect(
        SpotlightContentTemplatesHelpers.fieldMustNotMatch('name', ['winter'])(spotlightContent)
      ).toBe(true);
    });

    it('returns false when the value matches, ignoring case', () => {
      expect(
        SpotlightContentTemplatesHelpers.fieldMustNotMatch('name', ['SUMMER SALE'])(
          spotlightContent
        )
      ).toBe(false);
    });
  });
});
