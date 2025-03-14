import {TailwindLitElement} from '@/src/utils/tailwind.element';
import {i18n} from 'i18next';
import {CSSResultGroup, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {button, ButtonProps} from '../button';

type ItemKind = 'results' | 'products';

type SummaryLabel = `showing-${ItemKind}-of-load-more`;
type ButtonLabel = `load-more-${ItemKind}`;

/**
 * @internal
 */
@customElement('atomic-load-more-items')
export class AtomicLoadMoreItems extends TailwindLitElement {
  static styles: CSSResultGroup = [
    TailwindLitElement.styles,
    // unsafeCSS(styles),
  ];

  @property({type: Boolean})
  hasResults = false;

  @property({type: Boolean})
  isLoaded = false;

  @property({type: Number})
  from = 0;

  @property({type: Number})
  to = 0;

  @property({attribute: false})
  i18n!: i18n;

  @property({attribute: false})
  labels!: {
    summary: SummaryLabel;
    button: ButtonLabel;
  };

  @property({type: Boolean})
  moreAvailable = false;

  @property({attribute: false})
  onClick!: () => void;

  render() {
    if (!this.isLoaded || !this.hasResults) {
      return nothing;
    }

    return html`
      <div class="flex flex-col items-center" part="container">
        ${this.renderSummary()} ${this.renderProgressBar()}
        ${this.renderButton()}
      </div>
    `;
  }

  renderButton() {
    if (!this.moreAvailable) {
      return nothing;
    }

    const buttonProps: ButtonProps = {
      style: 'primary',
      part: 'load-more-results-button button',
      class: 'my-2 p-3 font-bold',
      onClick: () => this.onClick(),
    };
    return button({
      props: buttonProps,
      children: html`${this.i18n.t(this.labels.button)}`,
    });
  }

  renderProgressBar() {
    return html`
      <div
        part="progress-bar"
        class="bg-neutral relative my-2 h-1 w-72 rounded"
      >
        <div
          class="z-1 bg-linear-to-r from-more-results-progress-bar-color-from to-color-more-results-progress-bar-color-to absolute left-0 top-0 h-full overflow-hidden rounded"
          style="width: ${Math.ceil((this.from / this.to) * 100)}%"
        ></div>
      </div>
    `;
  }

  #wrapHighlight(content: string) {
    return `<span class="font-bold text-on-background" part="highlight">${content}</span>`;
  }

  renderSummary() {
    const locale = this.i18n.language;
    const content = this.i18n.t(this.labels.summary, {
      interpolation: {escapeValue: false},
      last: this.#wrapHighlight(this.from.toLocaleString(locale)),
      total: this.#wrapHighlight(this.to.toLocaleString(locale)),
    });

    return html`
      <div
        class="text-neutral-dark my-2 text-lg"
        part="showing-results summary"
      >
        ${unsafeHTML(content)}
      </div>
    `;
  }
}
