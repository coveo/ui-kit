import {Component, h, Element, Prop, Method, State} from '@stencil/core';
import {ResultTemplate, ResultTemplateCondition} from '@coveo/headless/insight';
import {MapProp} from '../../../utils/props-utils';
import {makeMatchConditions} from '../../common/result-template/result-template';

/**
 * The `atomic-result-template` component determines the format of the query results, depending on the conditions that are defined for each template. A `template` element must be the child of an `atomic-result-template`, and either an `atomic-result-list` or `atomic-folded-result-list` must be the parent of each `atomic-result-template`.
 *
 * Note: Any `<script>` tags defined inside of a `<template>` element will not be executed when results are being rendered.
 */
@Component({
  tag: 'atomic-insight-result-template',
  shadow: true,
})
export class AtomicInsightResultTemplate {
  @State() public error!: Error;

  @Element() public host!: HTMLDivElement;
  public matchConditions: ResultTemplateCondition[] = [];

  /**
   * A function that must return true on results for the result template to apply.
   *
   * For example, a template with the following condition only applies to results whose `title` contains `singapore`:
   * `[(result) => /singapore/i.test(result.title)]`
   */
  @Prop() public conditions: ResultTemplateCondition[] = [];

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

  public componentWillLoad() {
    this.matchConditions.push(
      ...makeMatchConditions(this.mustMatch, this.mustNotMatch)
    );
  }

  /**
   * Gets the appropriate result template based on conditions applied.
   */
  @Method()
  public async getTemplate(): Promise<ResultTemplate<DocumentFragment> | null> {
    if (this.error) {
      return null;
    }

    return {
      conditions: this.conditions.concat(this.matchConditions),
      content: this.host.querySelector('template')!.content!,
      priority: 1,
    };
  }

  public render() {
    if (this.error) {
      return (
        <atomic-component-error
          element={this.host}
          error={this.error}
        ></atomic-component-error>
      );
    }
  }
}
