import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {getErrorTitleFromErrorType} from './utils';

interface QueryErrorTitleProps {
  errorType?: string;
  i18n: i18n;
  organizationId: string;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const QueryErrorTitle: FunctionalComponent<QueryErrorTitleProps> = ({
  errorType,
  i18n,
  organizationId,
}) => {
  return (
    <p part="title" class="text-on-background mt-8 text-2xl">
      {getErrorTitleFromErrorType(i18n, organizationId, errorType)}
    </p>
  );
};
