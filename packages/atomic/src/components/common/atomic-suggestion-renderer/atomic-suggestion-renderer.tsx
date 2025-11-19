import {isMacOS} from '@/src/utils/device-utils';
import {Component, Fragment, Host, Prop, VNode, h} from '@stencil/core';
import {i18n} from 'i18next';
import {SearchBoxSuggestionElement} from '../suggestions/suggestions-types';

/**
 * The `atomic-suggestion-renderer` component is used to render individual suggestions. It was created to isolate
 * the rendering logic of the 'content' property of the `SearchBoxSuggestionElement` interface. This property can be Stencil
 * VNode or native Element so there must be a Stencil component to render it. For Lit components using this component, they will
 * use native Elements.
 *
 * @internal
 */
@Component({
  tag: 'atomic-suggestion-renderer',
  shadow: false,
})
export class AtomicSuggestionRenderer {
  @Prop() public i18n!: i18n;
  @Prop() public id!: string;
  @Prop() public suggestion!: SearchBoxSuggestionElement;
  @Prop() public isSelected!: boolean;
  @Prop() public side!: 'left' | 'right';
  @Prop() public index!: number;
  @Prop() public lastIndex!: number;
  @Prop() public isDoubleList!: boolean;
  @Prop() public onClick?: (e: Event) => void;
  @Prop() public onMouseOver?: (e: Event) => void;

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
    return this.isHTMLElement(this.suggestion.content) ? (
      <Fragment></Fragment>
    ) : (
      this.suggestion.content
    );
  }

  private ariaLabel(isButton: boolean) {
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

  private ensureContentForRenderedSuggestion(element: HTMLElement) {
    if (this.isHTMLElement(this.suggestion.content)) {
      element.replaceChildren(this.suggestion.content);
    }
  }

  private isHTMLElement(el: VNode | Element): el is HTMLElement {
    return el instanceof HTMLElement;
  }

  render() {
    const isButton = !!(this.suggestion.onSelect || this.suggestion.query);

    return (
      <Host class="contents">
        {isButton ? (
          <div
            id={this.id}
            key={this.suggestion.key}
            part={this.parts}
            class={this.classes}
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e: Event) => this.onClick?.(e)}
            onMouseOver={(e: Event) => this.onMouseOver?.(e)}
            data-query={this.suggestion.query}
            aria-label={this.ariaLabel(isButton)}
            ref={(el) => {
              if (!el) {
                return;
              }
              this.ensureContentForRenderedSuggestion(el);
            }}
          >
            {this.content}
          </div>
        ) : (
          <span
            id={this.id}
            key={this.suggestion.key}
            part={this.parts}
            class={this.classes}
            aria-label={this.ariaLabel(isButton)}
            ref={(el) => {
              if (!el) {
                return;
              }
              this.ensureContentForRenderedSuggestion(el);
            }}
          >
            {this.content}
          </span>
        )}
      </Host>
    );
  }
}
