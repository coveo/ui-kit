import {Component, Element, h, getAssetPath} from '@stencil/core';
import {Result, ResultTemplatesHelpers} from '@coveo/headless';
import {ResultContext} from '../result-template-decorators';
import {objectTypeIcons} from './object-type-icons';
import {fileTypeIcons} from './file-type-icons';

@Component({
  tag: 'atomic-result-icon',
  styleUrl: 'atomic-result-icon.pcss',
  shadow: false,
  assetsDirs: ['assets'],
})
export class AtomicResultIcon {
  @ResultContext() private result!: Result;

  @Element() host!: HTMLElement;

  private removeComponent() {
    this.host.remove();
  }

  public render() {
    const fileTypeValue = ResultTemplatesHelpers.getResultProperty(
      this.result,
      'filetype'
    ) as string;
    const objectTypeValue = ResultTemplatesHelpers.getResultProperty(
      this.result,
      'objecttype'
    ) as string;

    if (fileTypeValue === null && objectTypeValue === null) {
      return this.removeComponent();
    }

    const fileType = fileTypeIcons[fileTypeValue?.toLowerCase()];
    const objectType = objectTypeIcons[objectTypeValue?.toLowerCase()];
    const iconFile = objectType || fileType || 'custom';
    const iconPath = getAssetPath(`./assets/${iconFile}.svg`);

    return (
      <div
        class={`result-icon ${iconFile}`}
        style={{'background-image': `url(${iconPath})`}}
      ></div>
    );
  }
}
