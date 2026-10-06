import type {InteractiveSpotlightContent, SpotlightContent} from '@coveo/headless/commerce';
import type {LitElement} from 'lit';
import {InteractiveItemContextController} from '@/src/components/common/item-list/context/interactive-item-context-controller';
import {
  ItemContextController,
  type ItemContextEvent,
} from '@/src/components/common/item-list/context/item-context-controller';
import type {LitElementWithError} from '@/src/decorators/types';

export const spotlightContentContextEventName = 'atomic/resolveSpotlightContent';
export const interactiveSpotlightContentContextEventName =
  'atomic/resolveInteractiveSpotlightContent';

/**
 * Creates a [Lit reactive controller](https://lit.dev/docs/composition/controllers/) that resolves the spotlight content
 * of the parent `atomic-spotlight-content` element in spotlight content template components.
 *
 * Spotlight content is resolved through its own event, so product template components can't resolve it as a product.
 */
export function createSpotlightContentContextController(
  host: LitElement & {error: Error | null}
): ItemContextController<SpotlightContent> {
  return new ItemContextController<SpotlightContent>(host, {
    parentName: 'atomic-spotlight-content',
    eventName: spotlightContentContextEventName,
  });
}

/**
 * Creates a [Lit reactive controller](https://lit.dev/docs/composition/controllers/) that resolves the
 * `InteractiveSpotlightContent` sub-controller of the parent `atomic-spotlight-content` element.
 */
export function createInteractiveSpotlightContentContextController(
  host: LitElement & LitElementWithError
): InteractiveItemContextController<InteractiveSpotlightContent> {
  return new InteractiveItemContextController<InteractiveSpotlightContent>(host, {
    eventName: interactiveSpotlightContentContextEventName,
  });
}

export type SpotlightContentContextEvent = ItemContextEvent<SpotlightContent>;
export type InteractiveSpotlightContentContextEvent = CustomEvent<
  (interactiveSpotlightContent: InteractiveSpotlightContent) => void
>;
