import {Schema, NumberValue} from '@coveo/bueno';
import {
  buildInteractiveResult,
  InteractiveResult,
  Result,
} from '@coveo/headless';
import {Component, Element, h, Prop, State, VNode} from '@stencil/core';
import Arrow from '../../../../images/arrow-right.svg';
import {
  FocusTarget,
  FocusTargetController,
} from '../../../../utils/accessibility-utils';
import {InitializeBindings} from '../../../../utils/initialization-utils';
import {parseXML} from '../../../../utils/utils';
import {getAttributesFromLinkSlot} from '../../../common/result-link/attributes-slot';
import {LinkWithResultAnalytics} from '../../../common/result-link/result-link';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';
import {ResultContext} from '../result-template-decorators';

/**
 * The `atomic-result-printable-uri` component displays the URI, or path, to access a result.
 *
 * @slot attributes - Lets you pass [attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attributes) down to anchor elements, overriding other attributes.
 * To be used exclusively in anchor elements, such as: `<a slot="attributes" target="_blank" download></a>`.
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
  @State() error!: Error;

  /**
   * The maximum number of Uri parts to display. This has to be over the minimum of `3` in order to be effective. Putting `Infinity` will disable the ellipsis.
   */
  @Prop({reflect: true}) maxNumberOfParts = 5;

  @FocusTarget()
  private expandedPartFocus!: FocusTargetController;

  private interactiveResult!: InteractiveResult;
  private linkAttributes?: Attr[];

  public connectedCallback() {
    try {
      new Schema({
        maxNumberOfParts: new NumberValue({min: 3}),
      }).validate({maxNumberOfParts: this.maxNumberOfParts});
    } catch (error) {
      this.error = error as Error;
    }
    const slotName = 'attributes';
    this.linkAttributes = getAttributesFromLinkSlot(this.host, slotName);
  }

  public initialize() {
    this.interactiveResult = buildInteractiveResult(this.bindings.engine, {
      options: {result: this.result},
    });
  }

  private getIndexOfEllipsis(parentsCount: number) {
    const valuesToHide = Math.max(2, parentsCount - this.maxNumberOfParts);
    const valuesToShowBeforeEllipsis = parentsCount - valuesToHide - 1;
    return valuesToShowBeforeEllipsis;
  }

  private renderEllipsis() {
    return (
      <li>
        <button
          aria-label={this.bindings.i18n.t('collapsed-uri-parts')}
          onClick={(e) => {
            e.stopPropagation();
            this.expandedPartFocus.focusOnNextTarget();
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
    const ellipsisIndex = this.getIndexOfEllipsis(parents.length);
    return parents.map((parent, i) => {
      const name = parent.getAttribute('name');
      const uri = parent.getAttribute('uri')!;
      return (
        <li>
          {this.renderLink(name, uri, i === ellipsisIndex)}
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
        role="separator"
      ></atomic-icon>
    );
  }

  private renderParents() {
    const parents = this.allParents;
    if (this.listExpanded || parents.length <= this.maxNumberOfParts) {
      return parents;
    }

    return [
      parents.slice(0, this.getIndexOfEllipsis(parents.length)),
      this.renderEllipsis(),
      parents.slice(-1),
    ];
  }

  private renderLink(
    content: VNode | string | null,
    uri: string,
    shouldSetTarget: boolean
  ) {
    return (
      <LinkWithResultAnalytics
        href={uri}
        title={typeof content === 'string' ? content : undefined}
        onSelect={() => this.interactiveResult.select()}
        onBeginDelayedSelect={() => this.interactiveResult.beginDelayedSelect()}
        onCancelPendingSelect={() =>
          this.interactiveResult.cancelPendingSelect()
        }
        attributes={this.linkAttributes}
        ref={shouldSetTarget ? this.expandedPartFocus.setTarget : undefined}
      >
        {content}
      </LinkWithResultAnalytics>
    );
  }

  public render() {
    const parents = this.renderParents();
    if (parents.length) {
      return (
        <ul aria-label={this.bindings.i18n.t('printable-uri')}>{parents}</ul>
      );
    }

    return this.renderLink(
      <atomic-result-text field="printableUri"></atomic-result-text>,
      this.result.clickUri,
      false
    );
  }
}
