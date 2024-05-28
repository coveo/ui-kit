import {FunctionalComponent, h, Fragment} from '@stencil/core';

export const AutoCorrection: FunctionalComponent = () => {
  return (
    <Fragment>
      <p class="text-on-background mb-1" part="no-results">
        {this.withQuery(
          'no-results-for-did-you-mean',
          this.didYouMeanState!.originalQuery
        )}
      </p>
      <p class="text-on-background" part="auto-corrected">
        {this.withQuery(
          'query-auto-corrected-to',
          this.didYouMeanState!.wasCorrectedTo
        )}
      </p>
    </Fragment>
  );
};
