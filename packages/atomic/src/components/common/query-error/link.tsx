import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {KnownErrorType} from './known-error-types';

interface QueryErrorLinkProps {
  errorType?: string;
  i18n: i18n;
}

export const QueryErrorLink: FunctionalComponent<QueryErrorLinkProps> = ({
  errorType,
  i18n,
}) => {
  const getErrorLink = () => {
    switch (errorType as KnownErrorType) {
      case 'NoEndpointsException':
        return 'https://docs.coveo.com/en/mcc80216';
      case 'InvalidTokenException':
        return 'https://docs.coveo.com/en/102';
      case 'OrganizationIsPausedException':
        return 'https://docs.coveo.com/l6af0467';
      default:
        return null;
    }
  };

  const link = getErrorLink();

  return link ? (
    <a href={link} part="doc-link" class="btn-primary p-3 mt-10 inline-block">
      {i18n.t('coveo-online-help')}
    </a>
  ) : null;
};
