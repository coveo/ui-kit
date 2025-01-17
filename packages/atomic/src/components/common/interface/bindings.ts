import type {SearchEngine} from '@coveo/headless';
import {CommerceEngine} from '@coveo/headless/commerce';
import type {RecommendationEngine} from '@coveo/headless/recommendation';
import {i18n} from 'i18next';
import {CommerceStore} from '../../commerce/atomic-commerce-interface/store';
import {CommerceRecommendationStore} from '../../commerce/atomic-commerce-recommendation-interface/store';
import {InsightEngine} from '../../insight';
import {InsightStore} from '../../insight/atomic-insight-interface/store';
import {RecsStore} from '../../recommendations/atomic-recs-interface/store';
import {SearchStore} from '../../search/atomic-search-interface/store';

/**
 * Bindings passed from an interface to its children components.
 */
export interface CommonBindings<
  Engine extends AnyEngineType,
  Store extends AnyStore,
  InterfaceElement extends HTMLElement,
> {
  /**
   * A headless engine instance.
   */
  engine: Engine;
  /**
   * i18n instance, for localization.
   */
  i18n: i18n;
  /**
   * Global state for Atomic
   */
  store: Store;
  /**
   * A reference to the atomic interface element.
   */
  interfaceElement: InterfaceElement;
}
export interface NonceBindings {
  /**
   * Creates a Style Information element with the nonce attribute if it exists.
   * Note: the element is **not** appended to the DOM.
   * @returns a style element.
   */
  createStyleElement: () => HTMLStyleElement;

  /**
   * Creates a Script element with the nonce attribute if it exists.
   * Note: the element is **not** appended to the DOM.
   * @returns a script element.
   */
  createScriptElement: () => HTMLScriptElement;
}

export type AnyBindings = CommonBindings<AnyEngineType, AnyStore, HTMLElement>;

export type AnyEngineType =
  | SearchEngine
  | RecommendationEngine
  | InsightEngine
  | CommerceEngine;

type AnyStore =
  | CommerceStore
  | CommerceRecommendationStore
  | RecsStore
  | InsightStore
  | SearchStore;
