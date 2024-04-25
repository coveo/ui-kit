import {Component, Element, State, h, Listen, Prop} from '@stencil/core';
import {
  buildInsightInteractiveResult,
  InsightFoldedResultListState,
  InsightFoldedResultList,
  InsightFoldedResult,
} from '../..';
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
  ItemContext,
  ItemDisplayConfigContext,
} from '../../../common/item-list/item-decorators';
import {
  FoldedItemListContext,
  FoldedItemListStateContext,
} from '../../../common/item-list/item-list-decorators';
import {ItemTemplateProvider} from '../../../common/item-list/item-template-provider';
import {ItemDisplayImageSize} from '../../../common/layout/display-options';
import {ResultChildrenCommon} from '../../../common/result-children/result-children-common';
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
  public itemTemplateProvider?: ItemTemplateProvider;
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

  private resultChildrenCommon!: ResultChildrenCommon;

  @Listen('atomic/resolveChildTemplates')
  public resolveChildTemplates(event: ChildTemplatesContextEvent) {
    event.preventDefault();
    event.detail(this.itemTemplateProvider);
  }

  public initialize() {
    this.resultChildrenCommon = new ResultChildrenCommon({
      getHost: () => this.host,
      getBindings: () => this.bindings,
      getResult: () => this.result,
      getShowInitialChildren: () => this.showInitialChildren,
      getFoldedResultList: () => this.foldedResultList,
      getInitialChildren: () => this.initialChildren,
      getInheritTemplates: () => this.inheritTemplates,
      getResultTemplateRegistered: () => this.resultTemplateRegistered,
      getTemplateHasError: () => this.templateHasError,
      getNoResultText: () => this.noResultText,
      getDisplayConfig: () => this.displayConfig,
      getImageSize: () => this.imageSize,
      getFoldedResultListState: () => this.foldedResultListState,
      renderChild: this.renderChild.bind(this),
      setInitialChildren: (initialChildren: InsightFoldedResult[]) =>
        (this.initialChildren = initialChildren),
      toggleShowInitialChildren: () =>
        (this.showInitialChildren = !this.showInitialChildren),
    });

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
    this.resultChildrenCommon.componentWillRender();
  }

  public render() {
    return this.resultChildrenCommon.render();
  }
}
