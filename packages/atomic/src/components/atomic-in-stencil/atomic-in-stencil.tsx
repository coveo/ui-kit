import {Component, Element, h} from '@stencil/core';

/**
 * @internal
 */
@Component({
  tag: 'atomic-in-stencil',
  shadow: true,
})
export class InterfaceWrapper {
  @Element() private host!: HTMLElement;

  async componentDidLoad() {
    const searchInterface = this.host.shadowRoot!.querySelector(
      'atomic-search-interface'
    )!;
    await searchInterface.initialize({
      accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
      organizationId: 'searchuisamples',
    });

    searchInterface.executeFirstSearch();
  }

  render() {
    return (
      <atomic-search-interface>
        <atomic-search-layout>
          <atomic-layout-section section="search">
            <atomic-search-box></atomic-search-box>
          </atomic-layout-section>
          <atomic-layout-section section="facets">
            <atomic-facet-manager>
              <atomic-facet field="author" label="Authors"></atomic-facet>
              <atomic-facet field="language" label="Language"></atomic-facet>
            </atomic-facet-manager>
          </atomic-layout-section>
          <atomic-layout-section section="main">
            <atomic-layout-section section="status">
              <atomic-breadbox></atomic-breadbox>
              <atomic-query-summary></atomic-query-summary>
              <atomic-refine-toggle></atomic-refine-toggle>
              <atomic-sort-dropdown>
                <atomic-sort-expression
                  label="relevance"
                  expression="relevancy"
                ></atomic-sort-expression>
                <atomic-sort-expression
                  label="most-recent"
                  expression="date descending"
                ></atomic-sort-expression>
              </atomic-sort-dropdown>
              <atomic-did-you-mean></atomic-did-you-mean>
            </atomic-layout-section>
            <atomic-layout-section section="results">
              <atomic-result-list></atomic-result-list>
            </atomic-layout-section>
          </atomic-layout-section>
        </atomic-search-layout>
      </atomic-search-interface>
    );
  }
}
