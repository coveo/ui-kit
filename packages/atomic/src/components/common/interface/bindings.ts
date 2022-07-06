import type {SearchEngine} from '@coveo/headless';
import type {RecommendationEngine} from '@coveo/headless/recommendation';
import type {InsightEngine} from '@coveo/headless/insight';
import {i18n} from 'i18next';
import {AtomicCommonStoreData} from './store';
import {HTMLStencilElement} from '@stencil/core/internal';

export interface CommonStencilStore<StoreData extends AtomicCommonStoreData> {
  state: StoreData;

  get: <PropName extends keyof StoreData>(
    propName: PropName
  ) => StoreData[PropName];

  set: <PropName extends keyof StoreData>(
    propName: PropName,
    value: StoreData[PropName]
  ) => void;

  onChange: <PropName extends keyof StoreData>(
    propName: PropName,
    cb: (newValue: StoreData[PropName]) => void
  ) => () => void;
}

/**
 * Bindings passed from an interface to its children components.
 */
export interface CommonBindings<
  Engine extends AnyEngineType,
  Store extends CommonStencilStore<AtomicCommonStoreData>,
  InterfaceElement extends HTMLStencilElement
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

export type AnyBindings = CommonBindings<
  AnyEngineType,
  CommonStencilStore<AtomicCommonStoreData>,
  HTMLStencilElement
>;

export type AnyEngineType = SearchEngine | RecommendationEngine | InsightEngine;
