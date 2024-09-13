import {
  buildInteractiveResult,
  FoldedResult,
  FoldedResultList,
  FoldedResultListState,
} from '@coveo/headless';
import {Component, Element, State, h, Listen, Prop} from '@stencil/core';
import {buildCustomEvent} from '../../../../utils/event-utils';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {elementHasAncestorTag} from '../../../../utils/utils';
import {extractUnfoldedItem} from '../../../common/interface/item';
import {
  ChildTemplatesContext,
  ChildTemplatesContextEvent,
  DisplayConfig,
  ItemDisplayConfigContext,
} from '../../../common/item-list/item-decorators';
import {
  FoldedItemListContext,
  FoldedItemListStateContext,
} from '../../../common/item-list/item-list-decorators';
import {ItemTemplateProvider} from '../../../common/item-list/item-template-provider';
import {ItemDisplayImageSize} from '../../../common/layout/display-options';
import {ChildrenWrapper} from '../../../common/result-children/children-wrapper';
import {CollectionGuard} from '../../../common/result-children/collection-guard';
import {ResultChildrenGuard} from '../../../common/result-children/guard';
import {ShowHideButton} from '../../../common/result-children/show-hide-button';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';
import {ResultContext} from '../../result-template-components/result-template-decorators';

const childTemplateComponent = 'atomic-result-children-template';
const componentTag = 'atomic-result-children';

/**
 * The `atomic-result-children` component is responsible for displaying child results by applying one or more child result templates.
 * Includes two slots, "before-children" and "after-children", which allow for rendering content before and after the list of children,
 * only when children exist.
 * @part children-root - The wrapper for the message when there are child results
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
  public itemTemplateProvider?: ItemTemplateProvider;
  @FoldedItemListContext()
  private foldedResultList!: FoldedResultList;
  @ResultContext({folded: true})
  private result!: FoldedResult;
  @ItemDisplayConfigContext()
  private displayConfig!: DisplayConfig;
  private initialChildren!: FoldedResult[];

  @Element() public host!: HTMLDivElement;
  @State() public error!: Error;
  @State() private resultTemplateRegistered = false;
  @State() private templateHasError = false;
  @FoldedItemListStateContext()
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

    this.itemTemplateProvider = new ItemTemplateProvider({
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
    const content = this.itemTemplateProvider?.getTemplateContent(child.result);

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
          options: {result: extractUnfoldedItem(child)},
        })}
        store={this.bindings.store}
        density={this.displayConfig.density}
        imageSize={this.imageSize || this.displayConfig.imageSize}
        classes={`child-result ${isLast ? 'last-child' : ''}`.trim()}
      ></atomic-result>
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
    if (this.showInitialChildren) {
      this.foldedResultList.logShowMoreFoldedResults(this.result.result);
    } else {
      this.foldedResultList.logShowLessFoldedResults();
    }

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
