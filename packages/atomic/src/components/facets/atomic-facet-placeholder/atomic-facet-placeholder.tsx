import {Component, h, Host, Prop} from '@stencil/core';

/**
 * The `atomic-facet-placeholder` provides an intermediate visual state that is rendered before the first results are available.
 */
@Component({
  tag: 'atomic-facet-placeholder',
  styleUrl: 'atomic-facet-placeholder.pcss',
  shadow: true,
})
export class AtomicFacetPlaceholder {
  @Prop() public numberOfValues = 8;

  public render() {
    const facetValues = [];
    for (let i = 0; i < this.numberOfValues; i++) {
      facetValues.push(
        <div class="flex mt-4">
          <div class="h-5 w-6 bg-divider mr-5"></div>
          <div class="h-3 mt-1 bg-divider w-full"></div>
        </div>
      );
    }

    return (
      <Host aria-hidden>
        <div class="p-7 animate-pulse border border-divider rounded-xl mb-4">
          <div class="h-3 mb-2 bg-divider w-5/6"></div>
          {facetValues}
        </div>
      </Host>
    );
  }
}
