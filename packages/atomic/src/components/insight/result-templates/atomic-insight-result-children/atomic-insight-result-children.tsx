import {
  buildInteractiveResult as buildInsightInteractiveResult,
  FoldedResultListState as InsightFoldedResultListState,
  FoldedResult as InsightFoldedResult,
  FoldedResultList as InsightFoldedResultList,
} from '@coveo/headless/insight';
import {Component, Element, State, h, Listen, Prop} from '@stencil/core';
import {buildCustomEvent} from '../../../../utils/event-utils';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {elementHasAncestorTag} from '../../../../utils/utils';
import {extractUnfoldedItem} from '../../../common/item-list/unfolded-item';
import {
  FoldedItemListContext,
  FoldedItemListStateContext,
} from '../../../common/item-list/item-list-decorators';
import {ResultTemplateProvider} from '../../../common/item-list/result-template-provider';
import {
  ChildTemplatesContext,
  ChildTemplatesContextEvent,
  DisplayConfig,
  ItemContext,
  ItemDisplayConfigContext,
} from '../../../common/item-list/stencil-item-decorators';
import {ItemDisplayImageSize} from '../../../common/layout/display-options';
import {ChildrenWrapper} from '../../../common/result-children/stencil-children-wrapper';
import {CollectionGuard} from '../../../common/result-children/stencil-collection-guard';
import {ResultChildrenGuard} from '../../../common/result-children/stencil-guard';
import {ShowHideButton} from '../../../common/result-children/stencil-show-hide-button';
import {InsightBindings} from '../../atomic-insight-interface/atomic-insight-interface';

const childTemplateComponent = 'atomic-insight-result-children-template';
const componentTag = 'atomic-insight-result-children';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-result-children',
  styleUrl: 'atomic-insight-result-children.pcss',
  shadow: true,
})
export class AtomicResultChildren
  implements InitializableComponent<InsightBindings>
{
  @InitializeBindings() public bindings!: InsightBindings;
  @ChildTemplatesContext()
  public itemTemplateProvider?: ResultTemplateProvider;
  @FoldedItemListContext()
  private foldedResultList!: InsightFoldedResultList;
  @ItemContext({folded: true, parentName: 'atomic-insight-result'})
  private result!: InsightFoldedResult;
  @ItemDisplayConfigContext()
  private displayConfig!: DisplayConfig;
  private initialChildren!: InsightFoldedResult[];

  @Element() public host!: HTMLDivElement;
  @State() public error!: Error;
  @State() private resultTemplateRegistered = false;
  @State() private templateHasError = false;
  @FoldedItemListStateContext()
  @State()
  private foldedResultListState!: InsightFoldedResultListState;
  @State()
  private showInitialChildren = true;

  /**
   * Whether to inherit templates defined in a parent atomic-result-children. Only works for the second level of child nesting.
   */
  @Prop() inheritTemplates = false;
  /**
   * The expected size of the image displayed in the children results.
   */
  @Prop({reflect: true}) imageSize?: ItemDisplayImageSize;
  /**
   * The non-localized copy for an empty result state. An empty string will result in the component being hidden.
   */
  @Prop() public noResultText = 'no-documents-related';

  @Listen('atomic/resolveChildTemplates')
  public resolveChildTemplates(event: ChildTemplatesContextEvent) {
    event.preventDefault();
    event.detail(this.itemTemplateProvider);
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

    this.itemTemplateProvider = new ResultTemplateProvider({
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

  private renderChild(child: InsightFoldedResult, isLast: boolean) {
    const content = this.itemTemplateProvider?.getTemplateContent(child.result);

    if (!content) {
      return;
    }

    const key =
      child.result.uniqueId +
      child.children.map((child) => child.result.uniqueId);
    return (
      <atomic-insight-result
        key={key}
        content={content}
        result={child}
        interactiveResult={buildInsightInteractiveResult(this.bindings.engine, {
          options: {result: extractUnfoldedItem(child)},
        })}
        store={this.bindings.store}
        density={this.displayConfig.density}
        imageSize={this.imageSize || this.displayConfig.imageSize}
        classes={`child-result ${isLast ? 'last-child' : ''}`.trim()}
      ></atomic-insight-result>
    );
  }

  public componentWillRender() {
    if (this.initialChildren || !this.collection) {
      return;
    }

    this.initialChildren = this.collection.children;
  }

  private get collection() {
    return this.foldedResultListState.results.find((r) => {
      return r.result.uniqueId === this.result.result.uniqueId;
    });
  }

  private loadFullCollection() {
    this.host.dispatchEvent(
      buildCustomEvent('atomic/loadCollection', this.collection)
    );
  }
  private toggleShowInitialChildren = () => {
    this.showInitialChildren
      ? this.foldedResultList.logShowMoreFoldedResults(this.result.result)
      : this.foldedResultList.logShowLessFoldedResults();

    this.showInitialChildren = !this.showInitialChildren;
  };
  private renderCollection() {
    const collection = this.collection!;

    const children = this.showInitialChildren
      ? this.initialChildren
      : collection.children;

    return (
      <CollectionGuard
        isLoadingMoreResults={collection.isLoadingMoreResults}
        moreResultsAvailable={collection.moreResultsAvailable}
        hasChildren={collection.children.length > 0}
        numberOfChildren={collection.children.length}
        density={this.displayConfig.density}
        imageSize={this.imageSize || this.displayConfig.imageSize}
        noResultText={this.bindings.i18n.t(this.noResultText)}
      >
        <ShowHideButton
          moreResultsAvailable={collection.moreResultsAvailable}
          loadFullCollection={() => this.loadFullCollection()}
          showInitialChildren={this.showInitialChildren}
          toggleShowInitialChildren={this.toggleShowInitialChildren}
          loadAllResults={this.bindings.i18n.t('load-all-results')}
          collapseResults={this.bindings.i18n.t('collapse-results')}
        ></ShowHideButton>
        <ChildrenWrapper hasChildren={collection.children.length > 0}>
          {children.map((child, i) =>
            this.renderChild(child, i === children.length - 1)
          )}
        </ChildrenWrapper>
      </CollectionGuard>
    );
  }

  private renderFoldedResult() {
    if (this.result.children.length === 0) {
      return;
    }

    const children = this.result.children;

    return (
      <ChildrenWrapper hasChildren={children.length > 0}>
        {children.map((child, i) =>
          this.renderChild(child, i === children.length - 1)
        )}
      </ChildrenWrapper>
    );
  }

  public render() {
    return (
      <ResultChildrenGuard
        inheritTemplates={this.inheritTemplates}
        resultTemplateRegistered={this.resultTemplateRegistered}
        templateHasError={this.templateHasError}
      >
        {this.collection ? this.renderCollection() : this.renderFoldedResult()}
      </ResultChildrenGuard>
    );
  }
}
