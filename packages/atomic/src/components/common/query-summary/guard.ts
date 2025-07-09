import {html, nothing} from 'lit';
import {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';

interface QuerySummaryGuardProps {
  hasResults: boolean;
  hasError: boolean;
  firstSearchExecuted: boolean;
}

export const renderQuerySummaryGuard: FunctionalComponentWithChildren<
  QuerySummaryGuardProps
> =
  ({props}) =>
  (children) => {
    if (props.hasError || (!props.hasResults && props.firstSearchExecuted)) {
      return nothing;
    }

    if (!props.firstSearchExecuted) {
      return html`
        <div
          part="placeholder"
          aria-hidden="true"
          class="bg-neutral my-2 h-6 w-60 animate-pulse rounded"
        ></div>
      `;
    }

    return html`${children}`;
  };
