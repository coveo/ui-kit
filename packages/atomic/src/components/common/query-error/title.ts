import {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {i18n} from 'i18next';
import {html} from 'lit';
import {getErrorTitleFromErrorType} from './utils';

interface QueryErrorTitleProps {
  errorType?: string;
  i18n: i18n;
  organizationId: string;
}

export const renderQueryErrorTitle: FunctionalComponent<
  QueryErrorTitleProps
> = ({props}) => {
  return html`<p part="title" class="text-on-background mt-8 text-2xl">
    ${getErrorTitleFromErrorType(
      props.i18n,
      props.organizationId,
      props.errorType
    )}
  </p>`;
};
