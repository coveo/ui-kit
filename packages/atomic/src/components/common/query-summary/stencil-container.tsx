import {FunctionalComponent, h} from '@stencil/core';

interface QuerySummaryContainerProps {
  additionalClasses?: string;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const QuerySummaryContainer: FunctionalComponent<
  QuerySummaryContainerProps
> = ({additionalClasses}, children) => {
  return (
    <div
      class={`text-on-background${additionalClasses ? ` ${additionalClasses}` : ''}`}
      part="container"
    >
      {children}
    </div>
  );
};
