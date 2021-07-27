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
   * Specifies the icon to display, either from the list of available icons or a direct link.
   *
   * By default, this will parse the `objecttype` and `filetype` fields to find a matching icon. If none are available, it will use the `custom` icon.
   */
  @Prop() icon?: string;

  private svg: string | null = null;

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

  private get isPath() {
    return !!this.icon?.match(/^(https?:\/\/|\.\/|\.\.\/)/);
  }

  public async componentWillLoad() {
    const icon = this.icon || this.defaultIcon;
    const iconPath = this.isPath ? icon : getAssetPath(`./assets/${icon}.svg`);
    const response = await fetch(iconPath);
    this.svg =
      response.status === 200 || response.status === 304
        ? await response.text()
        : null;
  }

  public render() {
    return (
      <Host
        class={!this.isPath ? this.icon || this.defaultIcon : ''}
        innerHTML={this.svg}
      ></Host>
    );
  }
}
