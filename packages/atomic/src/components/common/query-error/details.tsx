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
      class="border-neutral bg-neutral-light mt-8 whitespace-pre-wrap rounded border p-3 text-left"
    >
      <code>{JSON.stringify(error, null, 2)}</code>
    </pre>
  );
};
