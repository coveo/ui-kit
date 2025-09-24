import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {bindings} from '@/src/decorators/bindings.js';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {randomID} from '../../../utils/utils';
import type {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';
import {buildInsightLayout} from './insight-layout';

/**
 * @internal
 */
@customElement('atomic-insight-layout')
@bindings()
@withTailwindStyles
export class AtomicInsightLayout
  extends LitElement
  implements InitializableComponent<InsightBindings>
{
  @state() bindings!: InsightBindings;
  @state() error!: Error;

  private styleTag?: HTMLStyleElement;

  /**
   * Whether the interface should be shown in widget format.
   */
  @property({type: Boolean, reflect: true}) widget = false;

  public initialize() {
    // No validation needed for this internal component
  }

  protected updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);
    if (changedProperties.has('widget')) {
      this.updateStyles();
    }
  }

  public updateStyles() {
    if (this.styleTag) {
      this.styleTag.innerHTML = buildInsightLayout(this, this.widget);
    } else {
      this.makeStyleTag();
    }
  }

  private makeStyleTag() {
    if (!this.bindings) return;
    this.styleTag = this.bindings.createStyleElement();
    this.styleTag.innerHTML = buildInsightLayout(this, this.widget);
    this.appendChild(this.styleTag);
  }

  protected firstUpdated() {
    const id = this.id || randomID('atomic-insight-layout-');
    this.id = id;

    this.makeStyleTag();
  }

  render() {
    // This component doesn't render any template, it only manages styles
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-layout': AtomicInsightLayout;
  }
}
