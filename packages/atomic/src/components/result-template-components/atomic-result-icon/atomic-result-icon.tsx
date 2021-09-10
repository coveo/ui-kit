import {Component, Element, h} from '@stencil/core';
import {Result, ResultTemplatesHelpers} from '@coveo/headless';
import {ResultContext} from '../../result-template-components/result-template-decorators';
import {objectTypeIcons} from './object-type-icons';
import {fileTypeIcons} from './file-type-icons';

/**
 * The `atomic-result-icon` component outputs the corresponding icon for a given file type.
 * The component searches for a suitable icon, or outputs a generic icon if the search is unsuccessful.
 */
@Component({
  tag: 'atomic-result-icon-v1',
  styleUrl: 'atomic-result-icon.pcss',
  shadow: true,
})
export class AtomicResultIcon {
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

  public render() {
    const icon = this.icon;
    return icon ? (
      <atomic-icon icon={'assets://' + icon} class={icon}></atomic-icon>
    ) : (
      <slot>
        <atomic-icon icon="assets://custom" class="custom"></atomic-icon>
      </slot>
    );
  }
}
