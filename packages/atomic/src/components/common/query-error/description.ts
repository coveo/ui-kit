import {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {i18n} from 'i18next';
import {html} from 'lit';
import {getErrorDescriptionFromErrorType} from './utils';

interface QueryErrorDescriptionProps {
  errorType?: string;
  i18n: i18n;
  url: string;
  organizationId: string;
}

export const renderQueryErrorDescription: FunctionalComponent<
  QueryErrorDescriptionProps
> = ({props}) => {
  return html`<p part="description" class="text-neutral-dark mt-2.5 text-lg">
    ${getErrorDescriptionFromErrorType(
      props.i18n,
      props.organizationId,
      props.url,
      props.errorType
    )}
  </p>`;
};
