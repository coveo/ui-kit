import type {SearchEngine} from '@coveo/headless';
import {CommerceEngine} from '@coveo/headless/commerce';
import type {RecommendationEngine} from '@coveo/headless/recommendation';
import {HTMLStencilElement} from '@stencil/core/internal';
import {i18n} from 'i18next';
import {CommerceStore} from '../../commerce/atomic-commerce-interface/store';
import {CommerceRecommendationStore} from '../../commerce/atomic-commerce-recommendation-interface/store';
import {InsightEngine} from '../../insight';
import {AtomicCommonStore, AtomicCommonStoreData} from './store';

type AnyStore = CommerceStore | CommerceRecommendationStore;
/**
 * Bindings passed from an interface to its children components.
 */
export interface CommonBindings<
  Engine extends AnyEngineType,
  Store extends AtomicCommonStore<AtomicCommonStoreData> | AnyStore,
  InterfaceElement extends HTMLStencilElement,
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

export type AnyBindings = CommonBindings<
  AnyEngineType,
  // Instead of AtomicCommonStoreData, it should follow AnyengineType and to CommerceStore| SearchStore | ...
  AtomicCommonStore<AtomicCommonStoreData> | AnyStore,
  HTMLStencilElement
>;

export type AnyEngineType =
  | SearchEngine
  | RecommendationEngine
  | InsightEngine
  | CommerceEngine;
