import type {SearchEngine} from '@coveo/headless';
import type {CommerceEngine} from '@coveo/headless/commerce';
import type {InsightEngine} from '@coveo/headless/insight';
import type {RecommendationEngine} from '@coveo/headless/recommendation';
import type {i18n} from 'i18next';
import type {CommerceStore} from '../../commerce/atomic-commerce-interface/store';
import type {CommerceRecommendationStore} from '../../commerce/atomic-commerce-recommendation-interface/store';
import type {InsightStore} from '../../insight/atomic-insight-interface/store';
import type {RecsStore} from '../../recommendations/atomic-recs-interface/store';
import type {SearchStore} from '../../search/atomic-search-interface/store';

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

/**
 * @deprecated
 * If used to inject style on a component with no shadow DOM, use the `LightDomMixin` mixin on Lit component.
 * If used to inject a styled layout, consider using `CommerceLayoutMixin` instead.
 */
export interface AdoptedStylesBindings {
  /**
   * @deprecated
   * An array of adopted stylesheets to be used in the shadow DOM.
   */
  addAdoptedStyleSheets: (stylesheet: CSSStyleSheet) => void;
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
