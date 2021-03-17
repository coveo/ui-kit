import {Component, h, Prop, Element} from '@stencil/core';
import {Result, ResultTemplatesHelpers} from '@coveo/headless';
import {ResultContext} from '../result-template-decorators';
import {filterProtocol} from '../../../utils/xss-utils';

/**
 * The ResultImage component renders an image from  a result field.
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
   * The result field which the component should use.
   * Will look in the Result object first and then in the Result.raw object for the fields.
   * It is important to include the necessary fields in the ResultList component.
   */
  @Prop() field!: string;

  public render() {
    const url = ResultTemplatesHelpers.getResultProperty(
      this.result,
      this.field
    ) as string;

    if (url === null) {
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
