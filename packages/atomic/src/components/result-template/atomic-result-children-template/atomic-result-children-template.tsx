import {ResultTemplateCondition} from '@coveo/headless';
import {Component, Element, Prop, State, Method} from '@stencil/core';
import {MapProp} from '../../../utils/props-utils';
import {
  addMatchConditions,
  getTemplate,
  renderIfError,
  validateTemplate,
} from '../result-template-common';

/**
 * TODO:
 * @internal
 */
@Component({
  tag: 'atomic-result-children-template',
  shadow: true,
})
export class AtomicResultChildrenTemplate {
  public matchConditions: ResultTemplateCondition[] = [];

  @Element() public host!: HTMLDivElement;

  @State() public error?: Error;

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
  @MapProp({splitValues: true}) public mustMatch: Record<string, string[]> = {};

  /**
   * Fields and field values that results must not match for the result template to apply.
   *
   * For example, a template with the following attribute only applies to result items whose `filetype` is not `lithiummessage`: `must-not-match-filetype="lithiummessage"`
   */
  @MapProp({splitValues: true}) public mustNotMatch: Record<string, string[]> =
    {};

  constructor() {
    validateTemplate.call(this, ['atomic-result-children'], false);
  }

  public componentWillLoad() {
    addMatchConditions.call(this);
  }

  /**
   * Gets the appropriate result template based on conditions applied.
   */
  @Method()
  public async getTemplate() {
    return getTemplate.call(this);
  }

  public render() {
    return renderIfError.call(this);
  }
}
