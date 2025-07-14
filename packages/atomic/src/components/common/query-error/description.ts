import type {i18n} from 'i18next';
import {html} from 'lit';
import {getErrorDescriptionFromErrorType} from './utils';

interface QueryErrorDescriptionProps {
  errorType?: string;
  i18n: i18n;
  url: string;
  organizationId: string;
}

export const renderQueryErrorDescription = ({
  props,
}: {
  props: QueryErrorDescriptionProps;
}) => {
  const {errorType, i18n, url, organizationId} = props;

  return html`
    <p part="description" class="text-neutral-dark mt-2.5 text-lg">
      ${getErrorDescriptionFromErrorType(i18n, organizationId, url, errorType)}
    </p>
  `;
};
