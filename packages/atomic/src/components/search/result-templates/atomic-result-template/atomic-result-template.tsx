import {ResultTemplate, ResultTemplateCondition} from '@coveo/headless';
import {Component, Element, Prop, Method, State} from '@stencil/core';
import {MapProp} from '../../../../utils/props-utils';
import {
  makeMatchConditions,
  ResultTemplateCommon,
} from '../../../common/result-templates/result-template-common';

/**
 * A [result template](https://docs.coveo.com/en/atomic/latest/usage/displaying-results#defining-a-result-template) determines the format of the query results, depending on the conditions that are defined for each template.
 *
 * @slot default - Mandatory. A `template` element that defines the structure of the result item.
 * @slot link - A `template` element that contains a single `atomic-result-link` component.
 *
 * **Note:** Any `<script>` tags that are defined inside a `<template>` element will not be executed when the results are being rendered.
 * @MapProp name: mustMatch;attr: must-match;docs: The field and values that define which result items the condition must be applied to. For example, a template with the following attribute only applies to result items whose `filetype` is `lithiummessage` or `YouTubePlaylist`: `must-match-filetype="lithiummessage,YouTubePlaylist"`;type: Record<string, string[]> ;default: {}
 * @MapProp name: mustNotMatch;attr: must-not-match;docs: The field and values that define which result items the condition must not be applied to. For example, a template with the following attribute only applies to result items whose `filetype` is not `lithiummessage`: `must-not-match-filetype="lithiummessage";type: Record<string, string[]> ;default: {}
 */
@Component({
  tag: 'atomic-result-template',
  shadow: true,
})
export class AtomicResultTemplate {
  private resultTemplateCommon: ResultTemplateCommon;

  @State() public error!: Error;

  @Element() public host!: HTMLDivElement;

  /**
   * A function that must return true on results for the result template to apply.
   * Set programmatically before initialization, not via attribute.
   *
   * For example, the following targets a template and sets a condition to make it apply only to results whose `title` contains `singapore`:
   * `document.querySelector('#target-template').conditions = [(result) => /singapore/i.test(result.title)];`
   */
  @Prop() public conditions: ResultTemplateCondition[] = [];

  @MapProp({splitValues: true}) public mustMatch: Record<string, string[]> = {};

  @MapProp({splitValues: true}) public mustNotMatch: Record<string, string[]> =
    {};

  constructor() {
    this.resultTemplateCommon = new ResultTemplateCommon({
      host: this.host,
      setError: (err) => {
        this.error = err;
      },
      validParents: [
        'atomic-result-list',
        'atomic-folded-result-list',
        'atomic-search-box-instant-results',
      ],
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
  public async getTemplate(): Promise<ResultTemplate<DocumentFragment> | null> {
    return this.resultTemplateCommon.getTemplate(this.conditions, this.error);
  }

  public render() {
    return this.resultTemplateCommon.renderIfError(this.error);
  }
}
