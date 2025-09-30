import {FoldedResult, Result} from '@coveo/headless';
import {
  InteractiveItemContext,
  InteractiveItemContextEvent,
  ItemContext,
  ItemContextEvent,
  itemContext,
} from '@/src/components/common/item-list/stencil-item-decorators';

/**
 * A [StencilJS property decorator](https://stenciljs.com/) to be used for result template components.
 * This allows the Stencil component to fetch the current result from its rendered parent, the `atomic-result` component.
 *
 * Example:
 * @ResultContext() private result!: Result;
 *
 * For more information and examples, view the "Utilities" section of the readme.
 * 
 * @deprecated should only be used for Stencil components. For Lit components, use `createResultContextController` from \@/src/components/search/result-template-component-utils/context/result-context-controller.ts
 */
export function ResultContext(opts: {folded: boolean} = {folded: false}) {
  return ItemContext({parentName: 'atomic-result', folded: opts.folded});
}

export function InteractiveResultContext() {
  return InteractiveItemContext();
}

export type ResultContextEvent<T = Result> = ItemContextEvent<T>;
export type InteractiveResultContextEvent = InteractiveItemContextEvent;

/**
 * Retrieves `Result` on a rendered `atomic-result`.
 *
 * This method is useful for building custom result template elements, see [Create a Result List](https://docs.coveo.com/en/atomic/latest/cc-search/create-custom-components/native-components/#custom-result-template-component-example) for more information.
 *
 * You should use the method in the [connectedCallback lifecycle method](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks).
 *
 * @param element The element that the event is dispatched to, which must be the child of a rendered "atomic-result" element.
 * @returns A promise that resolves on initialization of the parent "atomic-result" element, or rejects when there is no parent "atomic-result" element.
 * 
 * @deprecated should only be used for Stencil components. For Lit components, use `fetchResultContext` from \@/src/components/search/result-template-component-utils/context/fetch-result-context.ts
 */
export function resultContext<T extends Result | FoldedResult = Result>(
  element: Element
) {
  return itemContext<T>(element, 'atomic-result');
}
