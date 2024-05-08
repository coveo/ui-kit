import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {KnownErrorType} from './known-error-types';

interface QueryErrorTitleProps {
  errorType?: string;
  i18n: i18n;
  organizationId: string;
}

export const QueryErrorTitle: FunctionalComponent<QueryErrorTitleProps> = ({
  errorType,
  i18n,
  organizationId,
}) => {
  const getTitleFromType = () => {
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

  return (
    <p part="title" class="text-2xl text-on-background mt-8">
      {getTitleFromType()}
    </p>
  );
};
