// import {
// buildInteractiveResult,
// type FoldedCollection,
// type FoldedResult,
// type FoldedResultList,
// } from '@coveo/headless';
import {css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
// import {keyed} from 'lit/directives/keyed.js';
// import {ChildTemplatesContextController} from '@/src/components/common/item-list/context/child-templates-context-controller';
// import {FoldedItemListContextController} from '@/src/components/common/item-list/context/folded-item-list-context-controller';
// import {ItemDisplayConfigContextController} from '@/src/components/common/item-list/context/item-display-config-context-controller';
// import type {ResultTemplateProvider} from '@/src/components/common/item-list/result-template-provider';
// import {extractUnfoldedItem} from '@/src/components/common/item-list/unfolded-item';
import type {ItemDisplayImageSize} from '@/src/components/common/layout/item-layout-utils';
// import {renderChildrenWrapper} from '@/src/components/common/result-children/children-wrapper';
// import {renderCollectionGuard} from '@/src/components/common/result-children/collection-guard';
// import {renderShowHideButton} from '@/src/components/common/result-children/show-hide-button';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
// import {buildCustomEvent} from '@/src/utils/event-utils';
import '@/src/components/search/atomic-result/atomic-result';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {bindingGuard} from '@/src/decorators/binding-guard';
import { ChildTemplatesContextController } from '../../common/item-list/context/child-templates-context-controller';

// const childTemplateComponent = 'atomic-result-children-template';
// const componentTag = 'atomic-result-children';

/**
 * The `atomic-result-children` component is responsible for displaying child results by applying one or more child result templates.
 * Includes two slots, "before-children" and "after-children", which allow for rendering content before and after the list of children,
 * only when children exist.
 * @part children-root - The wrapper for the message when there are child results
 * @part no-result-root - The wrapper for the message when there are no results.
 * @part show-hide-button - The button that allows to collapse or show all child results.
 * @slot before-children - Slot that allows rendering content before the list of children, only when children exist.
 * @slot after-children - Slot that allows rendering content after the list of children, only when children exist.
 */
@customElement('atomic-result-children')
@bindings()
@withTailwindStyles
export class AtomicResultChildren
  extends LitElement
  implements InitializableComponent<Bindings>
{
  static styles = css`
  .show-hide-button {
  @apply set-font-size-sm;
}

.no-result-root {
  @apply text-neutral-dark;
}`;

  private itemTemplateController = new ChildTemplatesContextController(this);
  /**
   * Whether to inherit templates defined in a parent atomic-result-children. Only works for the second level of child nesting.
   */
  @property({
    type: Boolean,
    converter: booleanConverter,
    attribute: 'inherit-templates',
  })
  inheritTemplates = false;

  /**
   * The expected size of the image displayed in the children results.
   */
  @property({type: String, attribute: 'image-size', reflect: true})
  imageSize?: ItemDisplayImageSize;

  /**
   * The non-localized copy for an empty result state. An empty string will result in the component being hidden.
   */
  @property({type: String, attribute: 'no-result-text'})
  noResultText = 'no-documents-related';

  @state() public bindings!: Bindings;
  @state() public error!: Error;


initialize() {}

  @errorGuard()
  @bindingGuard()
  render(){ 
    return html`Boom`;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-children': AtomicResultChildren;
  }
}
