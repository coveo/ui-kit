import {FunctionalComponent, h} from '@stencil/core';

interface QuerySummaryContainerProps {
  additionalClasses?: string;
}
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
