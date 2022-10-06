import {Component, Element, Prop, Method, State} from '@stencil/core';
import {MapProp} from '../../../utils/props-utils';
import {RecsResultTemplateCondition, RecsResultTemplate} from '..';
import {
  makeMatchConditions,
  ResultTemplateCommon,
} from '../../common/result-templates/result-template-common';

/**
 * The `atomic-recs-result-template` component determines the format of the query results, depending on the conditions that are defined for each template. A `template` element must be the child of an `atomic-recs-result-template`, and an `atomic-recs-list` must be the parent of each `atomic-recs-result-template`.
 *
 * Note: Any `<script>` tags defined inside of a `<template>` element will not be executed when results are being rendered.
 * @MapProp name: mustMatch;attr: must-match;docs: The field and values that define which result items the condition must be applied to. For example, a template with the following attribute only applies to result items whose `filetype` is `lithiummessage` or `YouTubePlaylist`: `must-match-filetype="lithiummessage,YouTubePlaylist"`;type: Record<string, string[]> ;default: {}
 * @MapProp name: mustNotMatch;attr: must-not-match;docs: The field and values that define which result items the condition must not be applied to. For example, a template with the following attribute only applies to result items whose `filetype` is not `lithiummessage`: `must-not-match-filetype="lithiummessage";type: Record<string, string[]> ;default: {}
 *
 * @internal
 */
@Component({
  tag: 'atomic-recs-result-template',
  shadow: true,
})
export class AtomicRecsResultTemplate {
  private resultTemplateCommon: ResultTemplateCommon;

  @State() public error!: Error;

  @Element() public host!: HTMLDivElement;
  public matchConditions: RecsResultTemplateCondition[] = [];

  /**
   * A function that must return true on results for the result template to apply.
   *
   * For example, a template with the following condition only applies to results whose `title` contains `singapore`:
   * `[(result) => /singapore/i.test(result.title)]`
   */
  @Prop() public conditions: RecsResultTemplateCondition[] = [];

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
  @MapProp({splitValues: true}) public mustMatch: Record<string, string[]> = {};

  /**
   * The field and values that define which result items the condition must not be applied to.
   *
   * For example, a template with the following attribute only applies to result items whose `filetype` is not `lithiummessage`: `must-not-match-filetype="lithiummessage"`
   */
  @MapProp({splitValues: true}) public mustNotMatch: Record<string, string[]> =
    {};

  constructor() {
    this.resultTemplateCommon = new ResultTemplateCommon({
      host: this.host,
      setError: (err) => {
        this.error = err;
      },
      validParents: ['atomic-recs-list'],
      allowEmpty: true,
    });
  }

  public componentWillLoad() {
    this.resultTemplateCommon.matchConditions = makeMatchConditions(
      this.mustMatch,
      this.mustNotMatch
    );
  }

  /**
   * Gets the appropriate result template based on conditions applied.
   */
  @Method()
  public async getTemplate(): Promise<RecsResultTemplate<DocumentFragment> | null> {
    return this.resultTemplateCommon.getTemplate(this.conditions, this.error);
  }

  public render() {
    return this.resultTemplateCommon.renderIfError(this.error);
  }
}
