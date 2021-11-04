import {Component, Element, h, Prop, State, VNode} from '@stencil/core';
import {
  buildInteractiveResult,
  InteractiveResult,
  Result,
} from '@coveo/headless';
import {ResultContext} from '../result-template-decorators';
import {parseXML} from '../../../utils/utils';
import {
  Bindings,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {Schema, NumberValue} from '@coveo/bueno';
import Arrow from '../../../images/arrow-right.svg';
import {LinkWithResultAnalytics} from '../../result-link/result-link';

/**
 * The `atomic-result-printable-uri` component displays the URI, or path, to access a result.
 */
@Component({
  tag: 'atomic-result-printable-uri',
  styleUrl: 'atomic-result-printable-uri.pcss',
  shadow: false,
})
export class AtomicResultPrintableUri {
  @InitializeBindings() public bindings!: Bindings;
  @ResultContext() private result!: Result;
  @Element() public host!: HTMLElement;

  @State() listExpanded = false;
  private strings = {
    collapsedUriParts: () => this.bindings.i18n.t('collapsed-uri-parts'),
  };
  @State() error!: Error;

  /**
   * The maximum number of Uri parts to display. This has to be over the minimum of `3` in order to be effective. Putting `Infinity` will disable the ellipsis.
   */
  @Prop() maxNumberOfParts = 5;

  /**
   * Where to open the linked URL, as the name for a browsing context (a tab, window, or iframe).
   *
   * The following keywords have special meanings:
   *
   * * _self: the current browsing context. (Default)
   * * _blank: usually a new tab, but users can configure their browsers to open a new window instead.
   * * _parent: the parent of the current browsing context. If there's no parent, this behaves as `_self`.
   * * _top: the topmost browsing context (the "highest" context that’s an ancestor of the current one). If there are no ancestors, this behaves as `_self`.
   */
  @Prop() target = '_self';

  private interactiveResult!: InteractiveResult;

  public connectedCallback() {
    try {
      new Schema({
        maxNumberOfParts: new NumberValue({min: 3}),
      }).validate({maxNumberOfParts: this.maxNumberOfParts});
    } catch (error) {
      this.error = error as Error;
    }
  }

  public initialize() {
    this.interactiveResult = buildInteractiveResult(this.bindings.engine, {
      options: {result: this.result},
    });
  }

  private renderEllipsis() {
    return (
      <li>
        <button
          aria-label={this.strings.collapsedUriParts()}
          onClick={(e) => {
            e.preventDefault();
            this.listExpanded = true;
          }}
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
        <li>
          {this.renderLink(name, uri)}
          {i === parents.length - 1 ? null : this.renderSeparator()}
        </li>
      );
    });
  }

  private renderSeparator() {
    return (
      <atomic-icon
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

  private renderLink(content: VNode | string | null, uri: string) {
    return (
      <LinkWithResultAnalytics
        interactiveResult={this.interactiveResult}
        href={uri}
        title={typeof content === 'string' ? content : undefined}
        target={this.target}
      >
        {content}
      </LinkWithResultAnalytics>
    );
  }

  public render() {
    const parents = this.renderParents();
    if (parents.length) {
      return <ul>{parents}</ul>;
    }

    return this.renderLink(
      <atomic-result-text field="printableUri"></atomic-result-text>,
      this.result.clickUri
    );
  }
}
