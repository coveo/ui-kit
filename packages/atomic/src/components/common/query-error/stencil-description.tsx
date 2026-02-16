import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {getErrorDescriptionFromErrorType} from './utils';

interface QueryErrorDescriptionProps {
  errorType?: string;
  i18n: i18n;
  url: string;
  organizationId: string;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const QueryErrorDescription: FunctionalComponent<
  QueryErrorDescriptionProps
> = ({errorType, i18n, url, organizationId}) => {
  return (
    <p part="description" class="text-neutral-dark mt-2.5 text-lg">
      {getErrorDescriptionFromErrorType(i18n, organizationId, url, errorType)}
    </p>
  );
};
