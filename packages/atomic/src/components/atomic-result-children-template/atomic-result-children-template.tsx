import {
  FoldedResult,
  ResultTemplateCondition,
  ResultTemplatesHelpers,
} from '@coveo/headless';
import {Component, Element, h, State} from '@stencil/core';
import {MapProp} from '../../utils/props-utils';
import {FoldedResultContext} from '../result-template-components/result-template-decorators';

@Component({
  tag: 'atomic-result-children-template',
  shadow: true,
})
export class AtomicResultChildrenTemplate {
  private matchConditions: ResultTemplateCondition[] = [];
  @FoldedResultContext() private foldedResult!: FoldedResult;

  @State() private error?: Error;

  @Element() private host!: HTMLDivElement;

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
    const rootNode = this.host.parentElement?.getRootNode() as ShadowRoot;
    const isParentResultTemplate = rootNode.host?.tagName === 'ATOMIC-RESULT';

    if (!isParentResultTemplate) {
      this.error = new Error(
        'The "atomic-result-child-template" component has to be the child of an "atomic-result" component.'
      );
      return;
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

  public render() {
    if (this.error) {
      return (
        <atomic-component-error
          element={this.host}
          error={this.error}
        ></atomic-component-error>
      );
    }
    if (this.foldedResult.children.length) {
      const inner = this.host.innerHTML.trim();
      const els = this.foldedResult.children
        .map((child) => {
          if (
            this.matchConditions.every((condition) => condition(child.result))
          ) {
            return (
              <atomic-child-result
                result={child}
                templateHTML={inner || atomicLink}
              ></atomic-child-result>
            );
          }
        })
        .filter((el) => el);
      if (els.length) {
        return els;
      } else {
        this.host.remove();
      }
    }
  }
}

const atomicLink = '<atomic-result-link></atomic-result-link>';
