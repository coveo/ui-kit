import type {LitElement, TemplateResult} from 'lit';
import type {TemplateResultType} from 'lit/directive-helpers.js';
import type {AnyBindings} from '../components/common/interface/bindings';
import type {SearchBoxSuggestions} from '../components/common/suggestions/suggestions-types';

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
 * Base interface for any Atomic component that needs to be initialized with bindings
 * and supports error handling and cleanup.
 */
export interface BaseInitializableComponent<
  SpecificBindings extends AnyBindings = AnyBindings,
  ReturnType = void,
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
   * Method called right after the `bindings` property is defined.
   * Typically where Headless controllers or UI logic are initialized.
   */
  initialize: () => ReturnType;

  /**
   * Error encountered during component setup, if any.
   */
  error: Error;
}

/**
 * Interface for an Atomic component whose `initialize` method is called after bindings are initialized with the @bindings decorator.
 */
export type InitializableComponent<
  SpecificBindings extends AnyBindings = AnyBindings,
> = BaseInitializableComponent<SpecificBindings, void>;

/**
 * Interface for an Atomic component whose `initialize` method returns `SearchBoxSuggestions`.
 * Used for search box suggestions components that require specific bindings.
 */
export type SearchBoxSuggestionsComponent<
  SpecificBindings extends AnyBindings = AnyBindings,
> = BaseInitializableComponent<SpecificBindings, SearchBoxSuggestions>;

export interface LitElementWithError
  extends Pick<InitializableComponent, 'error'>,
    LitElement {}
