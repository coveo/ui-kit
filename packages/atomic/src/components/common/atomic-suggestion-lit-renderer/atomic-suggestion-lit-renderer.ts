import type {i18n} from 'i18next';
import {html, LitElement, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {createRef, type Ref, ref} from 'lit/directives/ref.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {isMacOS} from '@/src/utils/device-utils';
import type {SearchBoxSuggestionElement} from '../suggestions/suggestions-common';

/**
 * The `atomic-suggestion-renderer` component is used to render individual suggestions. It was created to isolate
 * the rendering logic of the 'content' property of the `SearchBoxSuggestionElement` interface. This property can be Stencil
 * VNode or native Element so there must be a Stencil component to render it. For Lit components using this component, they will
 * use native Elements.
 *
 * @internal
 */
@customElement('atomic-suggestion-lit-renderer')
@withTailwindStyles
export class AtomicSuggestionLitRenderer extends LitElement {
  @property({type: Object, attribute: false}) public i18n!: i18n;
  @property({type: String}) public id!: string;
  @property({type: Object, attribute: false})
  public suggestion!: SearchBoxSuggestionElement;
  @property({type: Boolean, attribute: 'is-selected'})
  public isSelected!: boolean;
  @property({type: String}) public side!: 'left' | 'right';
  @property({type: Number}) public index!: number;
  @property({type: Number, attribute: 'last-index'}) public lastIndex!: number;
  @property({type: Boolean, attribute: 'is-double-list'})
  public isDoubleList!: boolean;
  @property({type: Function, attribute: false}) public onClick?: (
    e: Event
  ) => void;
  @property({type: Function, attribute: false}) public onMouseOver?: (
    e: Event
  ) => void;

  private get parts() {
    let part = 'suggestion';
    if (this.isSelected) {
      part += ' active-suggestion';
    }
    if (this.suggestion.query) {
      part += ' suggestion-with-query';
    }
    if (this.suggestion.part) {
      part += ` ${this.suggestion.part}`;
    }
    return part;
  }

  private get classes() {
    return `flex px-4 min-h-10 items-center text-left text-neutral-dark cursor-pointer ${
      this.isSelected ? 'bg-neutral-light' : ''
    }`;
  }

  private get content() {
    // Since we're told this.suggestion.content is always an HTMLElement, return nothing
    // The content will be set via the ref callback
    return nothing;
  }

  private computeAriaLabel(isButton: boolean) {
    const contentLabel =
      this.suggestion.ariaLabel ??
      this.suggestion.query ??
      this.i18n.t('no-title');

    const labelWithType =
      isMacOS() && isButton
        ? this.i18n.t('search-suggestion-button', {
            label: contentLabel,
            interpolation: {escapeValue: false},
          })
        : contentLabel;

    const position = this.index + 1;
    const count = this.lastIndex + 1;

    if (!this.isDoubleList) {
      return this.i18n.t('search-suggestion-single-list', {
        label: labelWithType,
        position,
        count,
        interpolation: {escapeValue: false},
      });
    }

    return this.i18n.t('search-suggestion-double-list', {
      label: labelWithType,
      position,
      count,
      side: this.i18n.t(this.side === 'left' ? 'left' : 'right'),
      interpolation: {escapeValue: false},
    });
  }

  private ensureContentForRenderedSuggestion(element: HTMLElement | undefined) {
    if (element && this.suggestion.content instanceof HTMLElement) {
      element.replaceChildren(this.suggestion.content);
    }
  }

  private buttonRef: Ref<HTMLButtonElement> = createRef();
  private spanRef: Ref<HTMLSpanElement> = createRef();

  updated() {
    const element = this.buttonRef.value || this.spanRef.value;
    this.ensureContentForRenderedSuggestion(element);
  }

  render() {
    const isButton = !!(this.suggestion.onSelect || this.suggestion.query);

    return isButton
      ? html`<button
          id=${this.id}
          part=${this.parts}
          class=${this.classes}
          @mousedown=${(e: Event) => e.preventDefault()}
          @click=${(e: Event) => this.onClick?.(e)}
          @mouseover=${(e: Event) => this.onMouseOver?.(e)}
          data-query=${this.suggestion.query || nothing}
          aria-label=${this.computeAriaLabel(isButton)}
          ${ref(this.buttonRef)}
        >
          ${this.content}
        </button>`
      : html`<span
          id=${this.id}
          part=${this.parts}
          class=${this.classes}
          aria-label=${this.computeAriaLabel(isButton)}
          ${ref(this.spanRef)}
        >
          ${this.content}
        </span>`;
  }
}
