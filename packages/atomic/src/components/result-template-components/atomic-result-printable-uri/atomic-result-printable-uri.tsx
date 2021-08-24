import {Component, h, Prop, State} from '@stencil/core';
import {Result} from '@coveo/headless';
import {ResultContext} from '../result-template-decorators';
import {parseXML} from '../../../utils/utils';
import {
  Bindings,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {Schema, NumberValue} from '@coveo/bueno';
import {filterProtocol} from '../../../utils/xss-utils';
import Arrow from '../../../images/arrow-right.svg';

/**
 * The `atomic-result-printable-uri` component displays the URI, or path, to access a result.
 * @part result-printable-uri-list - A list of results as printable URIs.
 * @part result-printable-uri-list-expanded - The expanded list of printable URIs.
 * @part result-printable-uri-list-element - An element in the list of printable URIs.
 * @part result-printable-uri-link - A clickable link in a printable URI result.
 * @part result-printable-uri-list-ellipsis - The clickable ellipsis of a result URI.
 * @part result-printable-uri-list-separator - The visual separator between each part of the URI.
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
  private strings = {
    collapsedUriParts: () => this.bindings.i18n.t('collapsed-uri-parts'),
  };
  @State() error!: Error;

  /**
   * The maximum number of Uri parts to display. This has to be over the minimum of `3` in order to be effective. Putting `Infinity` will disable the ellipsis.
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
        {this.renderSeparator()}
      </li>
    );
  }

  private get allParents() {
    const parentsXml = parseXML(`${this.result.raw.parents}`);
    const parents = Array.from(parentsXml.getElementsByTagName('parent'));
    return parents.map((parent, i) => {
      const name = parent.getAttribute('name');
      const uri = parent.getAttribute('uri')!;
      return (
        <li part="result-printable-uri-list-element">
          <a part="result-printable-uri-link" href={filterProtocol(uri)}>
            {name}
          </a>
          {i === parents.length - 1 ? null : this.renderSeparator()}
        </li>
      );
    });
  }

  private renderSeparator() {
    return (
      <atomic-icon
        part="result-printable-uri-list-separator"
        class="result-printable-uri-separator"
        icon={Arrow}
      ></atomic-icon>
    );
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
      const parts = `result-printable-uri-list ${
        this.listExpanded ? ' result-printable-uri-list-expanded' : ''
      }`;

      return <ul part={parts}>{parents}</ul>;
    }

    return (
      <a
        part="result-printable-uri-link"
        href={filterProtocol(this.result.clickUri)}
      >
        <atomic-result-text field="printableUri"></atomic-result-text>
      </a>
    );
  }
}
