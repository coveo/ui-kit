import {Component, Element, h, getAssetPath, Host, Prop} from '@stencil/core';
import {Result, ResultTemplatesHelpers} from '@coveo/headless';
import {ResultContext} from '../result-template-decorators';
import {objectTypeIcons} from './object-type-icons';
import {fileTypeIcons} from './file-type-icons';

/**
 * The `atomic-result-icon` component outputs the corresponding icon for a given file type.
 * The component searches for a suitable icon, or outputs a generic icon if the search is unsuccessful.
 */
@Component({
  tag: 'atomic-result-icon',
  styleUrl: 'atomic-result-icon.pcss',
  shadow: false,
  assetsDirs: ['assets'],
})
export class AtomicResultIcon {
  @ResultContext() private result!: Result;

  @Element() host!: HTMLElement;

  /**
   * Specifies the icon to display from the list of available icons.
   *
   * By default, this will parse the `objecttype` and `filetype` fields to find a matching icon. If none are available, it will use the `custom` icon.
   */
  @Prop() icon?: string;

  private get defaultIcon() {
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
    return objectType || fileType || 'custom';
  }

  public render() {
    const icon = this.icon || this.defaultIcon;
    const iconPath = getAssetPath(`./assets/${icon}.svg`);

    return (
      <Host
        class={icon}
        style={{'background-image': `url(${iconPath})`}}
      ></Host>
    );
  }
}
