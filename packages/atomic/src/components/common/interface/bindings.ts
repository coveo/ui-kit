import type {SearchEngine} from '@coveo/headless';
import {CommerceEngine} from '@coveo/headless/commerce';
import type {RecommendationEngine} from '@coveo/headless/recommendation';
import {HTMLStencilElement} from '@stencil/core/internal';
import {i18n} from 'i18next';
import {InsightEngine} from '../../insight';
import {AtomicCommonStore, AtomicCommonStoreData} from './store';

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
  Store extends AtomicCommonStore<AtomicCommonStoreData>,
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

export type AnyBindings = CommonBindings<
  AnyEngineType,
  AtomicCommonStore<AtomicCommonStoreData>,
  HTMLStencilElement
>;

export type AnyEngineType =
  | SearchEngine
  | RecommendationEngine
  | InsightEngine
  | CommerceEngine;
