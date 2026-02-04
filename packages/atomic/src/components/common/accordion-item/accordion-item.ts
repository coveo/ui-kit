import {css, html, LitElement, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

@customElement('accordion-item')
export class AccordionItem extends LitElement {
  @property({type: String})
  itemTitle = '';
  @property({type: Boolean})
  hideTimeline = false;
  @property({type: Boolean, reflect: true})
  expanded = false;
  @property({type: Boolean})
  nonCollapsible = false;

  static styles = css`
    .item-header {
      display: flex;
    }

    .dot-container {
      width: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .dot {
      border-radius: 50%;
      height: 8px;
      width: 8px;
      background: #adb5bd;
    }

    .item-title {
      margin-left: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s;
      padding-right: 4px;
      padding-left: 4px;
      padding-top: 2px;
      padding-bottom: 2px;
    }

    .hoverable:hover {
      background-color: #f3f3f3;
      border-radius: 8px;
    }

    .item-body {
      display: flex;
    }

    .line-container {
      width: 10px;
      display: flex;
      justify-content: center;
      flex-shrink: 0;
    }

    .line {
      width: 1px;
      background: #e5e5e5;
    }

    .item-content {
      margin-left: 12px;
      padding-bottom: 12px;
      padding-top: 8px;
    }
  `;

  private toggle() {
    if (this.nonCollapsible) return;
    this.expanded = !this.expanded;
  }

  updated() {
    if (this.nonCollapsible && !this.expanded) {
      this.expanded = true;
    }
  }

  render() {
    return html`
      <div>
        <div class="item-header">
          <div class="dot-container">
            <div class="dot"></div>
          </div>
          <div
            @click=${this.toggle}
            class=${classMap({
              'item-title': true,
              hoverable: !this.nonCollapsible,
            })}
            class="item-title bg-transparent"
          >
            ${this.itemTitle}
          </div>
        </div>
        <div class="item-body">
          <div class="line-container">
            ${this.hideTimeline ? nothing : html`<div class="line"></div>`}
          </div>

          <div class="item-content">
            ${
              this.expanded
                ? html`
                  <div>
                    <slot></slot>
                  </div>
                `
                : null
            }
          </div>
        </div>
      </div>
    `;
  }
}
