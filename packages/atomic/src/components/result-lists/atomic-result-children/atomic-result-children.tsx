import {
  FoldedCollection,
  FoldedResult,
  FoldedResultList,
  FoldedResultListState,
  Result,
  ResultTemplatesManager,
} from '@coveo/headless';
import {Component, Element, State, h, Listen, Prop, Host} from '@stencil/core';
import {
  Bindings,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {elementHasAncestorTag} from '../../../utils/utils';
import {
  ResultContext,
  ChildTemplatesContext,
  ChildTemplatesContextEvent,
  ResultDisplayConfigContext,
  DisplayConfig,
} from '../../result-template-components/result-template-decorators';
import {BaseResultList, ResultListCommon} from '../result-list-common';
import {TemplateContent} from '../../result-templates/result-template-common';
import {
  FoldedResultListContext,
  FoldedResultListStateContext,
} from '../result-list-decorators';
import {ResultDisplayImageSize} from '../../atomic-result/atomic-result-display-options';
import {ListDisplayResultsPlaceholder} from '../list-display-results-placeholder';
import {Button} from '../../common/button';

const childTemplateComponent = 'atomic-result-children-template';
const componentTag = 'atomic-result-children';

/**
 * The `atomic-result-children` component is responsible for displaying child results by applying one or more child result templates.
 * Includes two slots, "before-children" and "after-children", which allow for rendering content before and after the list of children,
 * only when children exist.
 * @part no-result-root - The wrapper for the message when there are no results.
 * @part show-hide-button - The button that allows to collapse or show all child results.
 */
@Component({
  tag: 'atomic-result-children',
  styleUrl: 'atomic-result-children.pcss',
  shadow: true,
})
export class AtomicResultChildren implements BaseResultList<FoldedResult> {
  @InitializeBindings() public bindings!: Bindings;
  @ChildTemplatesContext()
  public templatesManager!: ResultTemplatesManager<TemplateContent>;
  @ResultContext({folded: true})
  private result!: FoldedResult;
  @ResultDisplayConfigContext()
  private displayConfig!: DisplayConfig;

  public resultListCommon!: ResultListCommon;

  @Element() public host!: HTMLDivElement;
  @State() public error!: Error;
  @State() public ready = false;
  @State() public templateHasError = false;

  @FoldedResultListContext()
  private foldedResultList!: FoldedResultList;

  @FoldedResultListStateContext()
  @State()
  private foldedResultListState!: FoldedResultListState;

  @State()
  private hideResults = false;

  @State()
  private showAllResults = false;

  /**
   * Whether to inherit templates defined in a parent atomic-result-children. Only works for the second level of child nesting.
   */
  @Prop() inheritTemplates = false;
  /**
   * The expected size of the image displayed in the children results.
   */
  @Prop({reflect: true}) imageSize?: ResultDisplayImageSize;
  /**
   * The copy for an empty result state.
   *
   * @defaultValue `No documents are related to this one.`
   */
  @Prop() public noResultText = '';

  private initialChildren!: FoldedResult[];

  @Listen('atomic/resolveChildTemplates')
  public resolveChildTemplates(event: ChildTemplatesContextEvent) {
    event.preventDefault();
    event.detail(this.resultListCommon?.resultTemplatesManager);
  }

  public async initialize() {
    const childrenTemplates = Array.from(
      this.host.querySelectorAll(childTemplateComponent)
    ).filter((template) => {
      return !elementHasAncestorTag(template, childTemplateComponent);
    });
    if (!childrenTemplates.length && !this.inheritTemplates) {
      this.error = new Error(
        `The "${componentTag}" component requires at least one "${childTemplateComponent}" component.`
      );
      return;
    }

    this.resultListCommon = new ResultListCommon({
      host: this.host,
      bindings: this.bindings,
      templateElements: this.host.querySelectorAll(childTemplateComponent),
      includeDefaultTemplate: false,
      onReady: () => {
        this.ready = true;
      },
      onError: () => {
        this.templateHasError = true;
      },
    });
  }

  private selectInheritedTemplate(result: Result) {
    const content = this.templatesManager?.selectTemplate(result);
    if (!content) {
      return;
    }

    const fragment = document.createDocumentFragment();
    const children = Array.from(content.children).filter(
      (el) =>
        el.tagName.toLowerCase() !== componentTag &&
        !el.querySelector(componentTag)
    );
    fragment.append(...children.map((c) => c.cloneNode(true)));
    return fragment;
  }

  private getContent(result: Result) {
    return (
      this.resultListCommon!.resultTemplatesManager.selectTemplate(result) ||
      this.selectInheritedTemplate(result)
    );
  }

  private renderChild(child: FoldedResult, isLast: boolean) {
    const content = this.getContent(child.result);
    if (!content) {
      return null;
    }
    return (
      <atomic-result
        key={child.result.uniqueId}
        content={content}
        result={child}
        engine={this.bindings.engine}
        store={this.bindings.store}
        density={this.displayConfig.density}
        imageSize={this.imageSize || this.displayConfig.imageSize}
        classes={`child-result ${isLast ? 'last-child' : ''}`.trim()}
      ></atomic-result>
    );
  }

  private getResult() {
    return (
      this.foldedResultListState.results.find((r) => {
        return r.result.uniqueId === this.result.result.uniqueId;
      }) || (this.result as FoldedCollection)
    );
  }

  private shouldShowChildrenWrapper() {
    const result = this.getResult();
    if (!this.initialChildren.length && this.hideResults) {
      return false;
    }
    return (
      Boolean(result.children.length) ||
      result.isLoadingMoreResults ||
      this.showAllResults
    );
  }

  public componentWillUpdate() {
    if (this.getResult().children && !this.initialChildren) {
      this.initialChildren = this.getResult().children;
    }
    if (this.getResult().isLoadingMoreResults && !this.showAllResults) {
      this.showAllResults = true;
    }
  }

  private get hasResults() {
    return this.getResult().children.length !== 0;
  }

  private getComponents() {
    const result = this.getResult();
    if (result.isLoadingMoreResults) {
      return (
        <ListDisplayResultsPlaceholder
          resultsPerPageState={{
            numberOfResults: result.children.length || 2,
          }}
          density={this.displayConfig.density}
          imageSize={this.imageSize || this.displayConfig.imageSize}
          isChild
        />
      );
    }
    if (this.hasResults) {
      const children = this.hideResults
        ? this.initialChildren
        : result.children;
      return children.map((child, i) =>
        this.renderChild(child, i === children.length - 1)
      );
    }
    if (this.showAllResults) {
      return (
        <p part="no-result-root" class="no-result-root">
          {this.noResultText || this.bindings.i18n.t('no-documents-related')}
        </p>
      );
    }
    return null;
  }

  private renderCollapseButton() {
    const result = this.getResult();
    if (
      Boolean(result.children.length) &&
      result.children.length !== this.initialChildren.length &&
      !result.isLoadingMoreResults &&
      !result.moreResultsAvailable
    ) {
      return (
        <Button
          part="show-hide-button"
          class="show-hide-button"
          style="text-primary"
          onClick={() => {
            if (this.hideResults) {
              this.foldedResultList.logShowMoreFoldedResults(
                this.result.result
              );
            } else {
              this.foldedResultList.logShowLessFoldedResults();
            }
            this.hideResults = !this.hideResults;
          }}
        >
          {this.bindings.i18n.t(
            this.hideResults ? 'load-all-results' : 'collapse-results'
          )}
        </Button>
      );
    }
    return null;
  }

  public render() {
    if (!this.ready) {
      return null;
    }
    if (this.templateHasError) {
      return <slot></slot>;
    }
    return (
      <Host>
        {this.renderCollapseButton()}
        {this.shouldShowChildrenWrapper() && (
          <div part="children-root">
            {this.hasResults && <slot name="before-children"></slot>}
            {this.getComponents()}
            {this.hasResults && <slot name="after-children"></slot>}
          </div>
        )}
      </Host>
    );
  }
}
