import type {i18n} from 'i18next';
import {html} from 'lit';
import {getErrorTitleFromErrorType} from './utils';

interface QueryErrorTitleProps {
  errorType?: string;
  i18n: i18n;
  organizationId: string;
}

export const renderQueryErrorTitle = ({
  props,
}: {
  props: QueryErrorTitleProps;
}) => {
  const {errorType, i18n, organizationId} = props;

  return html`
    <p part="title" class="text-on-background mt-8 text-2xl">
      ${getErrorTitleFromErrorType(i18n, organizationId, errorType)}
    </p>
  `;
};
