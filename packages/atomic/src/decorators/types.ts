import {TemplateResult} from 'lit';
import {TemplateResultType} from 'lit/directive-helpers.js';
import {AnyBindings} from '../components/common/interface/bindings';

export type GenericRender<T extends TemplateResultType> = TemplateResult<T>;

export type RenderGuardDecorator<
  Component,
  T extends TemplateResultType,
  Descriptor = TypedPropertyDescriptor<() => GenericRender<T>>,
> = (
  target: Component,
  propertyKey: 'render',
  descriptor: Descriptor
) => Descriptor;

/**
 * Necessary interface an Atomic Component must have to initialize itself correctly.
 */
export interface InitializableComponent<
  SpecificBindings extends AnyBindings = AnyBindings,
> {
  /**
   * Bindings passed from the `AtomicSearchInterface` to its children components.
   */
  bindings: SpecificBindings;

  /**
   * Flag to check if the component has been initialized.
   */
  initialized?: boolean;

  /**
   * Method called when the component is removed from the DOM.
   */
  unsubscribeLanguage?: () => void;

  /**
   * Method called right after the `bindings` property is defined. This is the method where Headless Framework controllers should be initialized.
   */
  initialize?: () => void;
  error: Error;
}
