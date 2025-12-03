import type {Result} from '@coveo/headless';
import {ResultTemplatesHelpers} from '@coveo/headless';
import bgIcons from '@salesforce-ux/design-system/design-tokens/dist/bg-standard.common';
import {css, html, LitElement, nothing} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import '@/src/components/common/atomic-icon/atomic-icon';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces';
import {createResultContextController} from '@/src/components/search/result-template-component-utils/context/result-context-controller';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {snakeToCamel} from '@/src/utils/utils';
import {fileTypeIcons} from './file-type-icons';
import {objectTypeIcons} from './object-type-icons';

/**
 * The `atomic-result-icon` component outputs the corresponding icon for a given file type.
 * The component searches for a suitable icon, or outputs a generic icon if the search is unsuccessful.
 *
 * @slot default - Fallback content to display when no matching icon is found.
 */
@customElement('atomic-result-icon')
@bindings()
export class AtomicResultIcon
  extends LitElement
  implements InitializableComponent<Bindings>
{
  static styles = css`
    :host {
      display: inline-block;
      width: 100%;
      height: auto;
    }

    atomic-icon {
      width: 100%;
    }
  `;

  public license =
    "Salesforce's specific icons originally from lightning design system (https://www.lightningdesignsystem.com/icons/). Icons licensed under Creative Commons Attribution-NoDerivatives 4.0 (https://github.com/salesforce-ux/design-system).";

  @state() public bindings!: Bindings;

  @state() public error!: Error;

  private resultController = createResultContextController(this);

  public initialize() {}

  private get result(): Result | null {
    const item = this.resultController.item;
    if (!item) {
      return null;
    }
    if ('result' in item) {
      return item.result as Result;
    }
    return item as Result;
  }

  private get icon(): string | null {
    if (!this.result) return null;

    const fileTypeValue = ResultTemplatesHelpers.getResultProperty(
      this.result,
      'filetype'
    ) as string;
    const objectTypeValue = ResultTemplatesHelpers.getResultProperty(
      this.result,
      'objecttype'
    ) as string;

    const fileType = fileTypeIcons[fileTypeValue?.toLowerCase()];
    const objectType = objectTypeIcons[objectTypeValue?.toLowerCase()];

    return objectType ?? fileType ?? null;
  }

  private renderIcon() {
    const icon = this.icon || 'document';
    const backgroundColor =
      bgIcons[snakeToCamel(icon) as keyof typeof bgIcons] || 'transparent';
    return html`
      <atomic-icon
        icon=${`assets://${icon}`}
        class=${icon}
        title=${icon}
        style="background-color: ${backgroundColor}"
      ></atomic-icon>
    `;
  }

  @errorGuard()
  protected render() {
    if (this.resultController.hasError) {
      return html`${nothing}`;
    }

    return when(
      this.icon,
      () => this.renderIcon(),
      () => html`<slot>${this.renderIcon()}</slot>`
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-icon': AtomicResultIcon;
  }
}
