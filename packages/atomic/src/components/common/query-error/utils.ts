import type {i18n} from 'i18next';
import type {KnownErrorType} from './known-error-types';

export const getErrorTitleFromErrorType = (
  i18n: i18n,
  organizationId: string,
  errorType?: string
) => {
  switch (errorType as KnownErrorType) {
    case 'Disconnected':
      return i18n.t('disconnected');
    case 'NoEndpointsException':
      return i18n.t('no-endpoints', {org: organizationId});
    case 'InvalidTokenException':
      return i18n.t('cannot-access', {org: organizationId});
    case 'OrganizationIsPausedException':
      return i18n.t('organization-is-paused', {org: organizationId});
    default:
      return i18n.t('something-went-wrong');
  }
};

export const getErrorDescriptionFromErrorType = (
  i18n: i18n,
  organizationId: string,
  url: string,
  errorType?: string
) => {
  switch (errorType as KnownErrorType) {
    case 'Disconnected':
      return i18n.t('check-your-connection', {url});
    case 'NoEndpointsException':
      return i18n.t('add-sources');
    case 'InvalidTokenException':
      return i18n.t('invalid-token');
    case 'OrganizationIsPausedException':
      return i18n.t('organization-will-resume', {
        org: organizationId,
      });
    default:
      return i18n.t('if-problem-persists');
  }
};

export const getAriaMessageFromErrorType = (
  i18n: i18n,
  organizationId: string,
  platformUrl: string,
  errorType?: string
) => {
  return `${getErrorTitleFromErrorType(i18n, organizationId, errorType)} ${getErrorDescriptionFromErrorType(i18n, organizationId, platformUrl, errorType)}`;
};
