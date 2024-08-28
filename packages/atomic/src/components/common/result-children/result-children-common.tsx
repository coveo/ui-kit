import {
  FoldedResult,
  FoldedResultList,
  FoldedResultListState,
} from '@coveo/headless';
import {Host, VNode, h} from '@stencil/core';
import {ResultsPlaceholder} from '../atomic-result-placeholder/placeholders';
import {Button} from '../button';
import {AnyBindings} from '../interface/bindings';
import {DisplayConfig} from '../item-list/item-decorators';
import {ItemDisplayImageSize} from '../layout/display-options';

interface ResultChildrenProps {
  getHost: () => HTMLElement;
  getBindings: () => AnyBindings;
  getFoldedResultListState: () => FoldedResultListState;
  getResult: () => FoldedResult;
  getShowInitialChildren: () => boolean;
  getFoldedResultList: () => FoldedResultList;
  getInitialChildren: () => FoldedResult[];
  getInheritTemplates: () => boolean;
  getResultTemplateRegistered: () => boolean;
  getTemplateHasError: () => boolean;
  getNoResultText: () => string;
  getDisplayConfig: () => DisplayConfig;
  getImageSize: () => ItemDisplayImageSize | undefined;
  renderChild: (child: FoldedResult, isLast: boolean) => VNode;
  setInitialChildren: (initialChildren: FoldedResult[]) => void;
  toggleShowInitialChildren: () => void;
}

export class ResultChildrenCommon {
  constructor(private props: ResultChildrenProps) {}

  private get foldedResult(): FoldedResult {
    return this.collection || this.props.getResult();
  }

  private get numberOfChildren() {
    return this.foldedResult.children.length;
  }

  private get hasChildren() {
    return !!this.numberOfChildren;
  }

  private get collection() {
    return this.props.getFoldedResultListState().results.find((r) => {
      return r.result.uniqueId === this.props.getResult().result.uniqueId;
    });
  }

  private renderPlaceholder() {
    return (
      <ResultsPlaceholder
        numberOfPlaceholders={this.numberOfChildren || 2}
        density={this.props.getDisplayConfig().density}
        display={'list'}
        imageSize={
          this.props.getImageSize() || this.props.getDisplayConfig().imageSize
        }
      />
    );
  }

  private renderNoResult() {
    console.log(this.props.getBindings().i18n.t(''));
    return (
      <p part="no-result-root" class="no-result-root my-3">
        {this.props.getBindings().i18n.t(this.props.getNoResultText())}
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
            if (this.props.getShowInitialChildren()) {
              this.props
                .getFoldedResultList()
                .logShowMoreFoldedResults(this.foldedResult.result);
            } else {
              this.props.getFoldedResultList().logShowLessFoldedResults();
            }
            this.props.toggleShowInitialChildren();
          }}
        >
          {this.props
            .getBindings()
            .i18n.t(
              this.props.getShowInitialChildren()
                ? 'load-all-results'
                : 'collapse-results'
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

  private renderChildren(children: FoldedResult[]): VNode | VNode[] {
    return this.renderChildrenWrapper(
      children.map((child, i) =>
        this.props.renderChild(child, i === children.length - 1)
      )
    );
  }

  private renderCollection() {
    const collection = this.collection!;

    if (collection.isLoadingMoreResults) {
      return this.renderChildrenWrapper(this.renderPlaceholder());
    }

    if (!collection.moreResultsAvailable && !this.hasChildren) {
      return this.props.getNoResultText()?.trim().length
        ? this.renderNoResult()
        : null;
    }

    if (!this.hasChildren) {
      return;
    }

    const childrenToRender = this.props.getShowInitialChildren()
      ? this.props.getInitialChildren()
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

  public componentWillRender() {
    const collection = this.collection;
    if (this.props.getInitialChildren() || !collection) {
      return;
    }

    this.props.setInitialChildren(collection.children);
  }

  public render() {
    console.log('empty binding', this.props.getBindings().i18n.t(''));

    if (
      !this.props.getInheritTemplates() &&
      !this.props.getResultTemplateRegistered()
    ) {
      return;
    }

    if (!this.props.getInheritTemplates() && this.props.getTemplateHasError()) {
      return <slot></slot>;
    }

    return this.collection
      ? this.renderCollection()
      : this.renderFoldedResult();
  }
}
