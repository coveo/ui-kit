import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {KnownErrorType} from './known-error-types';

interface QueryErrorDescriptionProps {
  errorType?: string;
  i18n: i18n;
  url: string;
  organizationId: string;
}

export const QueryErrorDescription: FunctionalComponent<
  QueryErrorDescriptionProps
> = ({errorType, i18n, url, organizationId}) => {
  const getErrorDescription = () => {
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
  return (
    <p part="description" class="text-lg text-neutral-dark mt-2.5">
      {getErrorDescription()}
    </p>
  );
};
