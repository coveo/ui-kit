import {
  buildInteractiveResult,
  FoldedResult,
  FoldedResultList,
  FoldedResultListState,
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
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {elementHasAncestorTag} from '../../../../utils/utils';
import {
  ResultContext,
  ChildTemplatesContextEvent,
  ResultDisplayConfigContext,
  DisplayConfig,
  ChildTemplatesContext,
} from '../../result-template-components/result-template-decorators';
import {
  FoldedResultListContext,
  FoldedResultListStateContext,
} from '../result-list-decorators';
import {ResultDisplayImageSize} from '../../../common/layout/display-options';
import {ResultsPlaceholder} from '../../../common/atomic-result-placeholder/placeholders';
import {Button} from '../../../common/button';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';
import {ResultTemplateProvider} from '../../../common/result-list/result-template-provider';
import {extractUnfoldedResult} from '../../../common/interface/result';

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
export class AtomicResultChildren implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  @ChildTemplatesContext()
  public resultTemplateProvider?: ResultTemplateProvider;
  @FoldedResultListContext()
  private foldedResultList!: FoldedResultList;
  @ResultContext({folded: true})
  private result!: FoldedResult;
  @ResultDisplayConfigContext()
  private displayConfig!: DisplayConfig;
  private initialChildren!: FoldedResult[];

  @Element() public host!: HTMLDivElement;
  @State() public error!: Error;
  @State() private resultTemplateRegistered = false;
  @State() private templateHasError = false;
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
    event.detail(this.resultTemplateProvider);
  }

  public initialize() {
    if (this.inheritTemplates) {
      return;
    }

    const childrenTemplates = Array.from(
      this.host.querySelectorAll(childTemplateComponent)
    ).filter(
      (template) => !elementHasAncestorTag(template, childTemplateComponent)
    );

    if (!childrenTemplates.length) {
      this.error = new Error(
        `The "${componentTag}" component requires at least one "${childTemplateComponent}" component.`
      );
      return;
    }

    this.resultTemplateProvider = new ResultTemplateProvider({
      includeDefaultTemplate: false,
      templateElements: childrenTemplates,
      getResultTemplateRegistered: () => this.resultTemplateRegistered,
      getTemplateHasError: () => this.templateHasError,
      setResultTemplateRegistered: (value: boolean) => {
        this.resultTemplateRegistered = value;
      },
      setTemplateHasError: (value: boolean) => {
        this.templateHasError = value;
      },
      bindings: this.bindings,
    });
  }

  private renderChild(child: FoldedResult, isLast: boolean) {
    const content = this.resultTemplateProvider?.getTemplateContent(
      child.result
    );

    if (!content) {
      return;
    }

    const key =
      child.result.uniqueId +
      child.children.map((child) => child.result.uniqueId);
    return (
      <atomic-result
        key={key}
        content={content}
        result={child}
        interactiveResult={buildInteractiveResult(this.bindings.engine, {
          options: {result: extractUnfoldedResult(child)},
        })}
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
      <ResultsPlaceholder
        numberOfPlaceholders={this.numberOfChildren || 2}
        density={this.displayConfig.density}
        imageSize={this.imageSize || this.displayConfig.imageSize}
      />
    );
  }

  private renderNoResult() {
    return (
      <p part="no-result-root" class="no-result-root my-3">
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
    return;
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
    if (!this.inheritTemplates && !this.resultTemplateRegistered) {
      return;
    }

    if (!this.inheritTemplates && this.templateHasError) {
      return <slot></slot>;
    }

    return this.collection
      ? this.renderCollection()
      : this.renderFoldedResult();
  }
}
