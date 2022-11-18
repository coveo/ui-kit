import {Result, ResultTemplatesHelpers} from '@coveo/headless';
import {Component, h, Prop, Element} from '@stencil/core';
import {
  InitializeBindings,
  InitializableComponent,
} from '../../../../utils/initialization-utils';
import {filterProtocol} from '../../../../utils/xss-utils';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';
import {ResultContext} from '../result-template-decorators';

/**
 * The `atomic-result-image` component renders an image from a result field.
 */
@Component({
  tag: 'atomic-result-image',
  styleUrl: 'atomic-result-image.pcss',
  shadow: false,
})
export class AtomicResultImage implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  @ResultContext() private result!: Result;
  @Element() private host!: HTMLElement;

  /**
   * The result field which the component should use. This will look for the field in the Result object first, then in the Result.raw object. It is important to include the necessary field in the ResultList component.
   */
  @Prop({reflect: true}) field!: string;

  public error!: Error;

  public get url() {
    const value = ResultTemplatesHelpers.getResultProperty(
      this.result,
      this.field
    );
    return Array.isArray(value) ? value[0] : value;
  }

  public render() {
    const url = this.url;

    if (!url) {
      this.host.remove();
      return;
    }

    if (typeof url !== 'string') {
      this.bindings.engine.logger.error(
        `Expected "${this.field}" to be a text field.`,
        this.host
      );
      this.host.remove();
      return;
    }

    return (
      <img
        alt={`${this.field} image`}
        src={filterProtocol(url)}
        loading="lazy"
      />
    );
  }
}
