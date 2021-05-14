import {Component, h, Prop, Element} from '@stencil/core';
import {Result, ResultTemplatesHelpers} from '@coveo/headless';
import {ResultContext} from '../result-template-decorators';
import {filterProtocol} from '../../../utils/xss-utils';

/**
 * The `atomic-result-image` component renders an image from a result field.
 *
 *  @part result-image - The img element.
 */
@Component({
  tag: 'atomic-result-image',
  shadow: false,
})
export class AtomicResultImage {
  @ResultContext() private result!: Result;
  @Element() private host!: HTMLElement;

  /**
   * The result field which the component should use. This will look for the field in the Result object first, then in the Result.raw object. It is important to include the necessary field in the ResultList component.
   */
  @Prop() field!: string;

  public render() {
    const url = ResultTemplatesHelpers.getResultProperty(
      this.result,
      this.field
    );

    if (typeof url !== 'string') {
      this.host.remove();
      return;
    }

    return (
      <img
        part="result-image"
        alt={`${this.field} image`}
        src={filterProtocol(url)}
      />
    );
  }
}
