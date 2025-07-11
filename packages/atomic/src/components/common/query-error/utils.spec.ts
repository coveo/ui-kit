import type {i18n} from 'i18next';
import {beforeAll, describe, expect, it} from 'vitest';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  getAriaMessageFromErrorType,
  getErrorDescriptionFromErrorType,
  getErrorTitleFromErrorType,
} from './utils';

describe('utils', () => {
  let i18n: i18n;
  const orgId = 'org123';
  const platformUrl = 'http://example.com';
  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  describe('#getErrorTitleFromErrorType', () => {
    it('should return the correct title when errorType is "Disconnected"', () => {
      expect(getErrorTitleFromErrorType(i18n, orgId, 'Disconnected')).toBe(
        'No access.'
      );
    });

    it('should return the correct title when errorType is "NoEndpointsException"', () => {
      expect(getErrorTitleFromErrorType(i18n, orgId, 'InvalidToken')).toBe(
        'Something went wrong.'
      );
    });

    it('should return the correct title when errorType is "InvalidTokenException"', () => {
      expect(
        getErrorTitleFromErrorType(i18n, orgId, 'InvalidTokenException')
      ).toBe('Your organization org123 cannot be accessed.');
    });

    it('should return the correct title when errorType is "OrganizationIsPausedException"', () => {
      expect(
        getErrorTitleFromErrorType(i18n, orgId, 'OrganizationIsPausedException')
      ).toBe(
        'Your organization org123 is paused due to inactivity and search is currently unavailable.'
      );
    });

    it('should return the default title for unknown error types', () => {
      expect(getErrorTitleFromErrorType(i18n, orgId, 'UnknownError')).toBe(
        'Something went wrong.'
      );
    });
  });

  describe('#getErrorDescriptionFromErrorType', () => {
    it('should return the correct description for "Disconnected"', () => {
      expect(
        getErrorDescriptionFromErrorType(
          i18n,
          orgId,
          platformUrl,
          'Disconnected'
        )
      ).toBe(
        "Your query couldn't be sent to the following URL: http:&#x2F;&#x2F;example.com. Verify your connection."
      );
    });

    it('should return the correct description for "NoEndpointsException"', () => {
      expect(
        getErrorDescriptionFromErrorType(
          i18n,
          orgId,
          platformUrl,
          'NoEndpointsException'
        )
      ).toBe(
        'Add content sources or wait for your newly created sources to finish indexing.'
      );
    });

    it('should return the correct description for "InvalidTokenException"', () => {
      expect(
        getErrorDescriptionFromErrorType(
          i18n,
          orgId,
          platformUrl,
          'InvalidTokenException'
        )
      ).toBe('Ensure that the token is valid.');
    });

    it('should return the correct description for "OrganizationIsPausedException"', () => {
      expect(
        getErrorDescriptionFromErrorType(
          i18n,
          orgId,
          platformUrl,
          'OrganizationIsPausedException'
        )
      ).toBe('Your organization is resuming and will be available shortly.');
    });

    it('should return a generic description for unknown error types', () => {
      expect(
        getErrorDescriptionFromErrorType(
          i18n,
          orgId,
          platformUrl,
          'UnknownError'
        )
      ).toBe('If the problem persists contact the administrator.');
    });
  });

  describe('#getAriaMessageFromErrorType', () => {
    it('should return the correct aria message for "Disconnected"', () => {
      expect(
        getAriaMessageFromErrorType(i18n, orgId, platformUrl, 'Disconnected')
      ).toBe(
        "No access. Your query couldn't be sent to the following URL: http:&#x2F;&#x2F;example.com. Verify your connection."
      );
    });

    it('should return the correct aria message for "NoEndpointsException"', () => {
      expect(
        getAriaMessageFromErrorType(
          i18n,
          orgId,
          platformUrl,
          'NoEndpointsException'
        )
      ).toBe(
        'Your organization org123 has no available content. Add content sources or wait for your newly created sources to finish indexing.'
      );
    });

    it('should return the correct aria message for "InvalidTokenException"', () => {
      expect(
        getAriaMessageFromErrorType(
          i18n,
          orgId,
          platformUrl,
          'InvalidTokenException'
        )
      ).toBe(
        'Your organization org123 cannot be accessed. Ensure that the token is valid.'
      );
    });

    it('should return the correct aria message for "OrganizationIsPausedException"', () => {
      expect(
        getAriaMessageFromErrorType(
          i18n,
          orgId,
          platformUrl,
          'OrganizationIsPausedException'
        )
      ).toBe(
        'Your organization org123 is paused due to inactivity and search is currently unavailable. Your organization is resuming and will be available shortly.'
      );
    });

    it('should return the correct aria message for unknown error types', () => {
      expect(
        getAriaMessageFromErrorType(i18n, orgId, platformUrl, 'UnknownError')
      ).toBe(
        'Something went wrong. If the problem persists contact the administrator.'
      );
    });
  });
});
