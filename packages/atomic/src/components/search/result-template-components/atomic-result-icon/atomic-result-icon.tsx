import {Result, ResultTemplatesHelpers} from '@coveo/headless';
import bgIcons from '@salesforce-ux/design-system/design-tokens/dist/bg-standard.common';
import {Component, Element, h} from '@stencil/core';
import {snakeToCamel} from '../../../../utils/utils';
import {ResultContext} from '@/src/components/search/result-template-component-utils/stencil-result-template-decorators';
import {fileTypeIcons} from './file-type-icons';
import {objectTypeIcons} from './object-type-icons';

/**
 * The `atomic-result-icon` component outputs the corresponding icon for a given file type.
 * The component searches for a suitable icon, or outputs a generic icon if the search is unsuccessful.
 */
@Component({
  tag: 'atomic-result-icon',
  styleUrl: 'atomic-result-icon.pcss',
  shadow: true,
})
export class AtomicResultIcon {
  public license =
    "Salesforce's specific icons originally from lightning design system (https://www.lightningdesignsystem.com/icons/). Icons licensed under Creative Commons Attribution-NoDerivatives 4.0 (https://github.com/salesforce-ux/design-system).";

  @ResultContext() private result!: Result;

  @Element() host!: HTMLElement;

  private get icon() {
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
    if (!fileType && !objectType) {
      return null;
    }
    return objectType || fileType;
  }

  private renderIcon() {
    const icon = this.icon || 'document';
    const backgroundColor = bgIcons[snakeToCamel(icon)] || 'transparent';
    return (
      <atomic-icon
        icon={'assets://' + icon}
        class={icon}
        title={icon}
        style={{backgroundColor}}
      ></atomic-icon>
    );
  }

  public render() {
    return this.icon ? this.renderIcon() : <slot>{this.renderIcon()}</slot>;
  }
}
