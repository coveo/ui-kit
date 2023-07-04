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
import {extractUnfoldedResult} from '../../../common/interface/result';
import {ResultDisplayImageSize} from '../../../common/layout/display-options';
import {ResultChildrenCommon} from '../../../common/result-children/result-children-common';
import {
  FoldedResultListContext,
  FoldedResultListStateContext,
} from '../../../common/result-list/result-list-decorators';
import {ResultTemplateProvider} from '../../../common/result-list/result-template-provider';
import {
  ChildTemplatesContext,
  ChildTemplatesContextEvent,
  DisplayConfig,
  ResultContext,
  ResultDisplayConfigContext,
} from '../../../search/result-template-components/result-template-decorators';
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
  public resultTemplateProvider?: ResultTemplateProvider;
  @FoldedResultListContext()
  private foldedResultList!: InsightFoldedResultList;
  @ResultContext({folded: true})
  private result!: InsightFoldedResult;
  @ResultDisplayConfigContext()
  private displayConfig!: DisplayConfig;
  private initialChildren!: InsightFoldedResult[];

  @Element() public host!: HTMLDivElement;
  @State() public error!: Error;
  @State() private resultTemplateRegistered = false;
  @State() private templateHasError = false;
  @FoldedResultListStateContext()
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
  @Prop({reflect: true}) imageSize?: ResultDisplayImageSize;
  /**
   * The non-localized copy for an empty result state.
   */
  @Prop() public noResultText = 'no-documents-related';

  private resultChildrenCommon!: ResultChildrenCommon;

  @Listen('atomic/resolveChildTemplates')
  public resolveChildTemplates(event: ChildTemplatesContextEvent) {
    event.preventDefault();
    event.detail(this.resultTemplateProvider);
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

  private renderChild(child: InsightFoldedResult, isLast: boolean) {
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
      <atomic-insight-result
        key={key}
        content={content}
        result={child}
        interactiveResult={buildInsightInteractiveResult(this.bindings.engine, {
          options: {result: extractUnfoldedResult(child)},
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
