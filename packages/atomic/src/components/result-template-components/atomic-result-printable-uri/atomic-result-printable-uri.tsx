import {Component, h, Prop, State} from '@stencil/core';
import {Result} from '@coveo/headless';
import {ResultContext} from '../result-template-decorators';
import {parseXML} from '../../../utils/utils';
import {
  Bindings,
  BindStateToI18n,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {Schema, NumberValue} from '@coveo/bueno';

/**
 * The ResultUri component displays the URI, or path, to access a result.
 * @part result-printable-uri-list - The result printable uri list
 * @part result-printable-uri-list-expanded - The expanded result printable uri list
 * @part result-printable-uri-list-element - A result printable uri list element
 * @part result-printable-uri-link - A result printable uri clickable link
 * @part result-printable-uri-list-ellipsis - The clickable ellipsis of a result uri
 */
@Component({
  tag: 'atomic-result-printable-uri',
  styleUrl: 'atomic-result-printable-uri.pcss',
  shadow: false,
})
export class AtomicResultPrintableUri {
  @InitializeBindings() public bindings!: Bindings;
  @ResultContext() private result!: Result;

  @State() listExpanded = false;
  @BindStateToI18n()
  @State()
  private strings = {
    collapsedUriParts: () => this.bindings.i18n.t('collapsedUriParts'),
  };
  @State() error!: Error;

  /**
   * The maximum number of Uri parts to display, has to be over the minimum of `3` in order to be effective. Putting `Infinity` will disable the ellipsis.
   */
  @Prop() maxNumberOfParts = 5;

  public connectedCallback() {
    try {
      new Schema({
        maxNumberOfParts: new NumberValue({min: 3}),
      }).validate({maxNumberOfParts: this.maxNumberOfParts});
    } catch (error) {
      this.error = error;
    }
  }

  private renderEllipsis() {
    return (
      <li part="result-printable-uri-list-element">
        <button
          part="result-printable-uri-list-ellipsis"
          aria-label={this.strings.collapsedUriParts()}
          onClick={() => (this.listExpanded = true)}
        >
          ...
        </button>
      </li>
    );
  }

  private get allParents() {
    const parentsXml = parseXML(`${this.result.raw.parents}`);
    const parents = Array.from(parentsXml.getElementsByTagName('parent'));
    return parents.map((parent) => {
      const name = parent.getAttribute('name');
      const uri = parent.getAttribute('uri')!;
      return (
        <li part="result-printable-uri-list-element">
          <a part="result-printable-uri-link" href={uri}>
            {name}
          </a>
        </li>
      );
    });
  }

  private renderParents() {
    const parents = this.allParents;
    if (this.listExpanded || parents.length <= this.maxNumberOfParts) {
      return parents;
    }

    const lastIndexBeforeEllipsis = Math.min(
      parents.length - 2,
      this.maxNumberOfParts - 1
    );
    return [
      parents.slice(0, lastIndexBeforeEllipsis),
      this.renderEllipsis(),
      parents.slice(-1),
    ];
  }

  public render() {
    const parents = this.renderParents();
    if (parents.length) {
      const parts = `result-printable-uri-list${
        this.listExpanded ? ' result-printable-uri-list-expanded' : ''
      }`;

      return <ul part={parts}>{parents}</ul>;
    }

    return (
      <a part="result-printable-uri-link" href={this.result.clickUri}>
        <atomic-result-value
          value="printableUri"
          shouldHighlightWith="printableUriHighlights"
        ></atomic-result-value>
      </a>
    );
  }
}
