import {bindStateToController} from '@/src/decorators/bind-state';
import {bindings} from '@/src/decorators/bindings.js';
import {InitializableComponent} from '@/src/decorators/types.js';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin';
import {
  UrlManager,
  Unsubscribe,
  UrlManagerState,
  ProductListing,
  ProductListingState,
  Search,
  SearchState,
  buildProductListing,
  buildSearch,
} from '@coveo/headless/commerce';
import {LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface.js';

@customElement('atomic-commerce-url-manager')
@bindings()
export class AtomicCommerceUrlManager
  extends InitializeBindingsMixin(LitElement)
  implements InitializableComponent<CommerceBindings>
{
  @state()
  public bindings!: CommerceBindings;

  @state()
  urlManager!: UrlManager;

  public initialized = false;
  @state()
  listingOrSearch!: ProductListing | Search;

  @state() public error!: Error;

  @state()
  @bindStateToController('listingOrSearch')
  productListingOrSearchState!: ProductListingState | SearchState;

  @state()
  @bindStateToController('urlManager')
  urlManagerState!: UrlManagerState;

  @property({
    type: Boolean,
    attribute: 'reflect-state-in-url',
    reflect: true,
    converter: {
      fromAttribute: (value) => value !== 'false',
      toAttribute: (value) => (value ? 'true' : 'false'),
    },
  })
  reflectStateInUrl = true;

  private unsubscribeUrlManager: Unsubscribe = () => {};

  public initialize() {
    if (this.bindings.interfaceElement.type === 'product-listing') {
      this.listingOrSearch = buildProductListing(this.bindings.engine);
    } else {
      this.listingOrSearch = buildSearch(this.bindings.engine);
    }

    if (!this.reflectStateInUrl || !this.bindings.engine) {
      return;
    }
    this.urlManager = this.listingOrSearch.urlManager({
      initialState: {fragment: window.location.hash.slice(1)},
    });

    this.unsubscribeUrlManager = this.urlManager.subscribe(() =>
      this.updateHash()
    );

    window.addEventListener('hashchange', this.onHashChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribeUrlManager();
    window.removeEventListener('hashchange', this.onHashChange);
  }

  private updateHash() {
    const newFragment = this.urlManager.state.fragment;

    if (!this.listingOrSearch.state.isLoading) {
      history.replaceState(null, document.title, `#${newFragment}`);
      this.bindings.engine.logger.info(`History replaceState #${newFragment}`);
      return;
    }

    history.pushState(null, document.title, `#${newFragment}`);
    this.bindings.engine.logger.info(`History pushState #${newFragment}`);
  }

  private onHashChange = () => {
    this.urlManager.synchronize(window.location.hash.slice(1));
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-url-manager': AtomicCommerceUrlManager;
  }
}
