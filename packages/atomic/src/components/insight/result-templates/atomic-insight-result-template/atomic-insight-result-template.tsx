import {
  ResultTemplate as InsightResultTemplate,
  ResultTemplateCondition as InsightResultTemplateCondition,
} from '@coveo/headless/insight';
import {Component, Element, Prop, Method, State} from '@stencil/core';
import {MapProp} from '../../../../utils/props-utils';
import {
  makeDefinedConditions,
  makeMatchConditions,
  ResultTemplateCommon,
} from '../../../common/result-templates/stencil-result-template-common';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-result-template',
  shadow: true,
})
export class AtomicInsightResultTemplate {
  private resultTemplateCommon!: ResultTemplateCommon;

  @State() public error!: Error;

  @Element() public host!: HTMLDivElement;
  public matchConditions: InsightResultTemplateCondition[] = [];

  /**
   * A function that must return true on results for the result template to apply.
   * Set programmatically before initialization, not via attribute.
   *
   * For example, the following targets a template and sets a condition to make it apply only to results whose `title` contains `singapore`:
   * `document.querySelector('#target-template').conditions = [(result) => /singapore/i.test(result.title)];`
   */
  @Prop() public conditions: InsightResultTemplateCondition[] = [];

  /**
   * The field that, when defined on a result item, would allow the template to be applied.
   *
   * For example, a template with the following attribute only applies to result items whose `filetype` and `sourcetype` fields are defined: `if-defined="filetype,sourcetype"`
   */
  @Prop({reflect: true}) ifDefined?: string;

  /**
   * The field that, when defined on a result item, would prevent the template from being applied.
   *
   * For example, a template with the following attribute only applies to result items whose `filetype` and `sourcetype` fields are NOT defined: `if-not-defined="filetype,sourcetype"`
   */
  @Prop({reflect: true}) ifNotDefined?: string;

  /**
   * The field and values that define which result items the condition must be applied to.
   *
   * For example, a template with the following attribute only applies to result items whose `filetype` is `lithiummessage` or `YouTubePlaylist`: `must-match-filetype="lithiummessage,YouTubePlaylist"`
   */
  @Prop() @MapProp({splitValues: true}) public mustMatch: Record<
    string,
    string[]
  > = {};

  /**
   * The field and values that define which result items the condition must not be applied to.
   *
   * For example, a template with the following attribute only applies to result items whose `filetype` is not `lithiummessage`: `must-not-match-filetype="lithiummessage"`
   */
  @Prop() @MapProp({splitValues: true}) public mustNotMatch: Record<
    string,
    string[]
  > = {};

  constructor() {}

  connectedCallback() {
    this.resultTemplateCommon = new ResultTemplateCommon({
      host: this.host,
      setError: (err) => {
        this.error = err;
      },
      validParents: [
        'atomic-insight-result-list',
        'atomic-insight-folded-result-list',
      ],
      allowEmpty: true,
    });
  }

  public componentWillLoad() {
    this.conditions = makeDefinedConditions(this.ifDefined, this.ifNotDefined);
    this.resultTemplateCommon.matchConditions = makeMatchConditions(
      this.mustMatch,
      this.mustNotMatch
    );
  }

  /**
   * Gets the appropriate result template based on conditions applied.
   */
  @Method()
  public async getTemplate(): Promise<InsightResultTemplate<DocumentFragment> | null> {
    return this.resultTemplateCommon.getTemplate(this.conditions, this.error);
  }

  public render() {
    return this.resultTemplateCommon.renderIfError(this.error);
  }
}
