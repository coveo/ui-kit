import {FunctionalComponent, h} from '@stencil/core';

interface QueryErrorDetailsProps {
  error: unknown;
  show: boolean;
}
export const QueryErrorDetails: FunctionalComponent<QueryErrorDetailsProps> = ({
  error,
  show,
}) => {
  if (!show) {
    return;
  }
  return (
    <pre
      part="error-info"
      class="text-left border border-neutral bg-neutral-light p-3 rounded mt-8 whitespace-pre-wrap"
    >
      <code>{JSON.stringify(error, null, 2)}</code>
    </pre>
  );
};
