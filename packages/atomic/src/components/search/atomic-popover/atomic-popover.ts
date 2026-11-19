import type {SearchStatus, SearchStatusState} from '@coveo/headless';
import {buildSearchStatus} from '@coveo/headless';
import {LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {FacetPopoverController} from '@/src/components/common/facets/popover/facet-popover-controller';
import type {Bindings} from '@/src/components/search/atomic-search-interface/atomic-search-interface';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {warnDeprecatedOnce} from '@/src/utils/deprecation-utils';
import facetCommonStyles from '../../common/facets/facet-common.tw.css';

// TODO - (v4) KIT-4958: Remove.
/**
 * The `atomic-popover` component displays any facet as a popover menu.
 *
 * @deprecated Use `atomic-facet-popover` instead.
 *
 * @slot default - The required slotted facet.
 * @part backdrop - The transparent backdrop hiding the content behind popover menu.
 * @part popover-button - The button to click to display or hide the popover menu.
 * @part value-label - The associated facet label.
 * @part value-count - Number of selected values for the facet
 * @part arrow-icon - The arrow icon on the button to display or hide the popover menu.
 * @part placeholder - The placeholder displayed when the facet is loading.
 * @part facet - The wrapper that contains the slotted 'facet'.
 */
@customElement('atomic-popover')
@bindings()
@withTailwindStyles
export class AtomicPopover extends LitElement implements InitializableComponent<Bindings> {
  static styles = [facetCommonStyles];

  @state()
  bindings!: Bindings;

  @state()
  error!: Error;

  @bindStateToController('searchStatus')
  @state()
  public searchStatusState!: SearchStatusState;
  public searchStatus!: SearchStatus;

  private popoverController = new FacetPopoverController(this);

  public initialize() {
    warnDeprecatedOnce(
      this.bindings.engine.logger,
      'The `atomic-popover` component',
      'Use `atomic-facet-popover` instead.'
    );
    this.searchStatus = buildSearchStatus(this.bindings.engine);

    const error = this.popoverController.validateChildren();
    if (error) {
      this.error = error;
    }
  }

  @bindingGuard()
  @errorGuard()
  public render() {
    return this.popoverController.render();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-popover': AtomicPopover;
  }
}
