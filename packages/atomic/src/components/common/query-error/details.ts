import {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {html, nothing} from 'lit';

export interface QueryErrorDetailsProps {
  error: unknown;
  show: boolean;
}

export const renderQueryErrorDetails: FunctionalComponent<
  QueryErrorDetailsProps
> = ({props}) => {
  if (!props.show) {
    return nothing;
  }

  return html`<pre
    part="error-info"
    class="border-neutral bg-neutral-light mt-8 rounded border p-3 text-left whitespace-pre-wrap"
  >
    <code>${JSON.stringify(props.error, null, 2)}</code>
  </pre
  >`;
};
