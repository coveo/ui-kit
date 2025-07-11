import type {i18n} from 'i18next';
import {html, nothing} from 'lit';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import type {KnownErrorType} from './known-error-types';

interface QueryErrorLinkProps {
  errorType?: string;
  i18n: i18n;
}

export const renderQueryErrorLink: FunctionalComponent<QueryErrorLinkProps> = ({
  props,
}) => {
  const getErrorLink = () => {
    switch (props.errorType as KnownErrorType) {
      case 'NoEndpointsException':
        return 'https://docs.coveo.com/en/mcc80216';
      case 'InvalidTokenException':
        return 'https://docs.coveo.com/en/102';
      case 'OrganizationIsPausedException':
        return 'https://docs.coveo.com/en/1684';
      default:
        return null;
    }
  };

  const link = getErrorLink();

  return link
    ? html`<a
        href=${link}
        part="doc-link"
        class="btn-primary mt-10 inline-block p-3"
      >
        ${props.i18n.t('coveo-online-help')}
      </a>`
    : nothing;
};
