import {HTMLStencilElement} from '@stencil/core/internal';
import {i18n} from 'i18next';
import {AnyEngineType} from './search-interface-common';

/**
 * Bindings passed from the `AtomicSearchInterface` to its children components.
 */
export interface CommonBindings<
  Engine extends AnyEngineType,
  StoreCreation,
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
  store: StoreCreation;
  /**
   * A reference to the atomic interface element.
   */
  interfaceElement: InterfaceElement;
}
