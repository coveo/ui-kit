import {Component, h, Element, State} from '@stencil/core';
import {
  FacetManager,
  buildFacetManager,
  Engine,
  Unsubscribe,
  FacetManagerState,
} from '@coveo/headless';
import {Initialization} from '../../utils/initialization-utils';

interface FacetElement extends HTMLElement {
  facetId: string;
}

@Component({
  tag: 'atomic-facet-manager',
  styleUrl: 'atomic-facet-manager.css',
  shadow: true,
})
export class AtomicFacetManager {
  @State() state!: FacetManagerState;
  @Element() host!: HTMLDivElement;
  private engine!: Engine;
  private unsubscribe: Unsubscribe = () => {};
  private facetManager!: FacetManager;

  @Initialization()
  public initialize() {
    this.facetManager = buildFacetManager(this.engine);

    this.unsubscribe = this.facetManager.subscribe(() => {
      this.updateStateToTriggerRender();
      this.sortFacets();
    });
  }

  public disconnectedCallback() {
    this.unsubscribe();
  }

  private updateStateToTriggerRender() {
    this.state = this.facetManager.state;
  }

  private sortFacets() {
    const payload = this.facets.map((f) => ({facetId: f.facetId, payload: f}));
    const sortedFacets = this.facetManager.sort(payload).map((f) => f.payload);

    this.host.append(...sortedFacets);
  }

  private get facets() {
    const facets: FacetElement[] = [];
    const children = Array.from(this.host.children);

    children.forEach((child) => {
      this.isPseudoFacet(child) && facets.push(child);
    });

    return facets;
  }

  private isPseudoFacet(el: Element): el is FacetElement {
    return 'facetId' in el;
  }

  public render() {
    return <slot />;
  }
}
