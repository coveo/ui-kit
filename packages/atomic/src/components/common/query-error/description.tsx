import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {getErrorDescriptionFromErrorType} from './utils';

interface QueryErrorDescriptionProps {
  errorType?: string;
  i18n: i18n;
  url: string;
  organizationId: string;
}

export const QueryErrorDescription: FunctionalComponent<
  QueryErrorDescriptionProps
> = ({errorType, i18n, url, organizationId}) => {
  return (
    <p part="description" class="text-lg text-neutral-dark mt-2.5">
      {getErrorDescriptionFromErrorType(i18n, organizationId, url, errorType)}
    </p>
  );
};
