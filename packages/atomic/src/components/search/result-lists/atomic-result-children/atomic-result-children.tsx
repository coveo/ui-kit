import {
  FoldedResult,
  FoldedResultList,
  FoldedResultListState,
  Result,
  ResultTemplatesManager,
} from '@coveo/headless';
import {
  Component,
  Element,
  State,
  h,
  Listen,
  Prop,
  Host,
  VNode,
} from '@stencil/core';
import {InitializeBindings} from '../../../../utils/initialization-utils';
import {elementHasAncestorTag} from '../../../../utils/utils';
import {
  ResultContext,
  ChildTemplatesContext,
  ChildTemplatesContextEvent,
  ResultDisplayConfigContext,
  DisplayConfig,
} from '../../result-template-components/result-template-decorators';
import {
  BaseResultList,
  ResultListCommon,
} from '../../../common/result-list/result-list-common';
import {TemplateContent} from '../../../common/result-templates/result-template-common';
import {
  FoldedResultListContext,
  FoldedResultListStateContext,
} from '../result-list-decorators';
import {ResultDisplayImageSize} from '../../../common/layout/display-options';
import {ListDisplayResultsPlaceholder} from '../../../common/atomic-result-placeholder/placeholders';
import {Button} from '../../../common/button';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';

const childTemplateComponent = 'atomic-result-children-template';
const componentTag = 'atomic-result-children';

/**
 * The `atomic-result-children` component is responsible for displaying child results by applying one or more child result templates.
 * Includes two slots, "before-children" and "after-children", which allow for rendering content before and after the list of children,
 * only when children exist.
 * @part no-result-root - The wrapper for the message when there are no results.
 * @part show-hide-button - The button that allows to collapse or show all child results.
 * @slot before-children - Slot that allows rendering content before the list of children, only when children exist.
 * @slot after-children - Slot that allows rendering content after the list of children, only when children exist.
 */
@Component({
  tag: 'atomic-result-children',
  styleUrl: 'atomic-result-children.pcss',
  shadow: true,
})
export class AtomicResultChildren implements BaseResultList<Bindings> {
  @InitializeBindings() public bindings!: Bindings;
  public resultListCommon!: ResultListCommon<Bindings>;
  @ChildTemplatesContext()
  public templatesManager!: ResultTemplatesManager<TemplateContent>;
  @FoldedResultListContext()
  private foldedResultList!: FoldedResultList;
  @ResultContext({folded: true})
  private result!: FoldedResult;
  @ResultDisplayConfigContext()
  private displayConfig!: DisplayConfig;
  private initialChildren!: FoldedResult[];

  @Element() public host!: HTMLDivElement;
  @State() public error!: Error;
  @State() public ready = false;
  @State() public templateHasError = false;
  @FoldedResultListStateContext()
  @State()
  private foldedResultListState!: FoldedResultListState;
  @State()
  private showInitialChildren = false;

  /**
   * Whether to inherit templates defined in a parent atomic-result-children. Only works for the second level of child nesting.
   */
  @Prop() inheritTemplates = false;
  /**
   * The expected size of the image displayed in the children results.
   */
  @Prop({reflect: true}) imageSize?: ResultDisplayImageSize;
  /**
   * The non-localized copy for an empty result state.
   */
  @Prop() public noResultText = 'no-documents-related';

  @Listen('atomic/resolveChildTemplates')
  public resolveChildTemplates(event: ChildTemplatesContextEvent) {
    event.preventDefault();
    event.detail(this.resultListCommon?.resultTemplatesManager);
  }

  public async initialize() {
    const childrenTemplates = Array.from(
      this.host.querySelectorAll(childTemplateComponent)
    ).filter(
      (template) => !elementHasAncestorTag(template, childTemplateComponent)
    );

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

  private getTemplatedContent(result: Result) {
    return (
      this.resultListCommon!.resultTemplatesManager.selectTemplate(result) ||
      this.selectInheritedTemplate(result)
    );
  }

  private renderChild(child: FoldedResult, isLast: boolean) {
    const content = this.getTemplatedContent(child.result);
    if (!content) {
      return null;
    }

    const key =
      child.result.uniqueId +
      child.children.map((child) => child.result.uniqueId);
    return (
      <atomic-result
        key={key}
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

  private get collection() {
    return this.foldedResultListState.results.find((r) => {
      return r.result.uniqueId === this.result.result.uniqueId;
    });
  }

  private get foldedResult(): FoldedResult {
    return this.collection || this.result;
  }

  private get numberOfChildren() {
    return this.foldedResult.children.length;
  }

  private get hasChildren() {
    return !!this.numberOfChildren;
  }

  public componentWillRender() {
    const collection = this.collection;
    if (this.initialChildren || !collection) {
      return;
    }

    this.initialChildren = collection.children;
  }

  private renderPlaceholder() {
    return (
      <ListDisplayResultsPlaceholder
        numberOfPlaceholders={this.numberOfChildren || 2}
        density={this.displayConfig.density}
        imageSize={this.imageSize || this.displayConfig.imageSize}
        isChild
      />
    );
  }

  private renderNoResult() {
    return (
      <p part="no-result-root" class="no-result-root">
        {this.bindings.i18n.t(this.noResultText)}
      </p>
    );
  }

  private renderCollapseButton() {
    const collection = this.collection!;
    if (!!collection.children.length && !collection.moreResultsAvailable) {
      return (
        <Button
          part="show-hide-button"
          class="show-hide-button"
          style="text-primary"
          onClick={() => {
            if (this.showInitialChildren) {
              this.foldedResultList.logShowMoreFoldedResults(
                this.result.result
              );
            } else {
              this.foldedResultList.logShowLessFoldedResults();
            }
            this.showInitialChildren = !this.showInitialChildren;
          }}
        >
          {this.bindings.i18n.t(
            this.showInitialChildren ? 'load-all-results' : 'collapse-results'
          )}
        </Button>
      );
    }
    return null;
  }

  private renderChildrenWrapper(content: VNode | VNode[]) {
    return (
      <div part="children-root">
        {this.hasChildren && <slot name="before-children"></slot>}
        {content}
        {this.hasChildren && <slot name="after-children"></slot>}
      </div>
    );
  }

  private renderChildren(children: FoldedResult[]) {
    return this.renderChildrenWrapper(
      children.map((child, i) =>
        this.renderChild(child, i === children.length - 1)
      )
    );
  }

  private renderCollection() {
    const collection = this.collection!;

    if (collection.isLoadingMoreResults) {
      return this.renderChildrenWrapper(this.renderPlaceholder());
    }

    if (!collection.moreResultsAvailable && !this.hasChildren) {
      return this.renderNoResult();
    }

    if (!this.hasChildren) {
      return;
    }

    const childrenToRender = this.showInitialChildren
      ? this.initialChildren
      : collection.children;

    return (
      <Host>
        {this.renderCollapseButton()}
        {this.renderChildren(childrenToRender)}
      </Host>
    );
  }

  private renderFoldedResult() {
    if (!this.hasChildren) {
      return;
    }

    return this.renderChildren(this.foldedResult.children);
  }

  public render() {
    if (!this.ready) {
      return null;
    }

    if (this.templateHasError) {
      return <slot></slot>;
    }

    return this.collection
      ? this.renderCollection()
      : this.renderFoldedResult();
  }
}
