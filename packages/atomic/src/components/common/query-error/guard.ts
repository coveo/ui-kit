import {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {html, nothing, TemplateResult} from 'lit';

interface QueryErrorGuardProps {
  hasError: boolean;
}

type FunctionalComponentChildren = TemplateResult | typeof nothing;

export const renderQueryErrorGuard: FunctionalComponentWithChildren<
  QueryErrorGuardProps
> =
  ({props}) =>
  (children: FunctionalComponentChildren) => {
    if (!props.hasError) {
      return nothing;
    }

    return html`${children}`;
  };
