import {HTMLStencilElement} from '@stencil/core/internal';
import {i18n} from 'i18next';
import {AnyEngineType} from './interface-common';
import {AtomicCommonStoreData} from './store';

export interface ExtensibleStencilStore<
  StoreData extends AtomicCommonStoreData
> {
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
  Store extends ExtensibleStencilStore<AtomicCommonStoreData>,
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
  ExtensibleStencilStore<AtomicCommonStoreData>,
  HTMLStencilElement
>;
