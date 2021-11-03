import {Component, Element, Prop, Method, State, h} from '@stencil/core';
import {
  ResultTemplate,
  ResultTemplateCondition,
  ResultTemplatesHelpers,
} from '@coveo/headless';
import {MapProp} from '../../utils/props-utils';

export type TemplateContent = DocumentFragment;

/**
 * The `atomic-result-template` component determines the format of the query results, depending on the conditions that are defined for each template. A `template` element must be the child of an `atomic-result-template`, and an `atomic-result-list` must be the parent of each `atomic-result-template`.
 *
 * Note: Any `<script>` tags defined inside of a `<template>` element will not be executed when results are being rendered.
 */
@Component({
  tag: 'atomic-result-template',
  shadow: true,
})
export class AtomicResultTemplate {
  private matchConditions: ResultTemplateCondition[] = [];

  @Element() private host!: HTMLDivElement;

  @State() private error?: Error;

  /**
   * A function that must return true on results for the result template to apply.
   *
   * For example, a template with the following condition only applies to results whose `title` contains `singapore`:
   * `[(result) => /singapore/i.test(result.title)]`
   */
  @Prop() public conditions: ResultTemplateCondition[] = [];

  /**
   * Fields and field values that results must match for the result template to apply.
   *
   * For example, a template with the following attribute only applies to result items whose `filetype` is `lithiummessage` or `YouTubePlaylist`: `must-match-filetype="lithiummessage,YouTubePlaylist"`
   */
  @MapProp() public mustMatch: Record<string, string[]> = {};

  /**
   * Fields and field values that results must not match for the result template to apply.
   *
   * For example, a template with the following attribute only applies to result items whose `filetype` is not `lithiummessage`: `must-not-match-filetype="lithiummessage"`
   */
  @MapProp() public mustNotMatch: Record<string, string[]> = {};

  constructor() {
    const isParentResultList =
      this.host.parentElement?.nodeName === 'ATOMIC-RESULT-LIST';

    if (!isParentResultList) {
      this.error = new Error(
        'The "atomic-result-template" component has to be the child of an "atomic-result-list" component.'
      );
      return;
    }

    if (!this.host.querySelector('template')) {
      this.error = new Error(
        'The "atomic-result-template" component has to contain a "template" element as a child.'
      );
    }

    if (this.host.querySelector('template')?.content.querySelector('script')) {
      console.warn(
        'Any "script" tags defined inside of "template" elements are not supported and will not be executed when the results are rendered',
        this.host
      );
    }
  }

  public componentWillLoad() {
    for (const field in this.mustMatch) {
      this.matchConditions.push(
        ResultTemplatesHelpers.fieldMustMatch(field, this.mustMatch[field])
      );
    }

    for (const field in this.mustNotMatch) {
      this.matchConditions.push(
        ResultTemplatesHelpers.fieldMustNotMatch(
          field,
          this.mustNotMatch[field]
        )
      );
    }
  }

  /**
   * Gets the appropriate result template based on conditions applied.
   */
  @Method()
  public async getTemplate(): Promise<ResultTemplate<TemplateContent> | null> {
    if (this.error) {
      return null;
    }

    return {
      conditions: this.getConditions(),
      content: this.getContent(),
      priority: 1,
    };
  }

  private getConditions() {
    return this.conditions.concat(this.matchConditions);
  }

  private getTemplateElement() {
    return (
      this.host.querySelector('template') ?? document.createElement('template')
    );
  }

  private getContent() {
    return this.getTemplateElement().content;
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
