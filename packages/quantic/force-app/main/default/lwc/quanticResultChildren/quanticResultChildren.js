import collapseResults from '@salesforce/label/c.quantic_CollapseResults';
import loadAllResults from '@salesforce/label/c.quantic_LoadAllResults';
import noMoreDocumentsRelated from '@salesforce/label/c.quantic_NoMoreDocumentsRelated';
import {LightningElement, api} from 'lwc';
// @ts-ignore
import loadingTemplate from './loading.html';
// @ts-ignore
import resultChildrenTemplate from './quanticResultChildren.html';

/** @typedef {import("coveo").FoldedCollection} FoldedCollection */
/** @typedef {import("coveo").FoldedResult} FoldedResult */
/** @typedef {import("coveo").FoldedResultList} FoldedResultList */
/** @typedef {import("coveo").ResultTemplatesManager} ResultTemplatesManager */

/**
 * The `QuanticResultChildren` component is responsible for displaying the child results of a given result.
 * This component includes two slots, "before-children" and "after-children", which allow for rendering content before and after the list of children, only when children exist.
 * @category Result Template
 * @slot before-children - Slot that allows rendering content before the list of children, only when children exist.
 * @slot after-children - Slot that allows rendering content after the list of children, only when children exist.
 * @example
 * <c-quantic-result-children engine-id={engineId} collection={collection} template-id="example-template-id" folded-result-list-controller={foldedResultListController} result-templates-manager={resultTemplatesManager}>
 *   <div slot="before-children">Attached documents</div>
 * </c-quantic-result-children>
 */
export default class QuanticResultChildren extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The folded collection containing the result and its children.
   * @api
   * @type {FoldedCollection}
   */
  @api collection;
  /**
   * The ID of the template used to display the child results.
   * @api
   * @type {string}
   */
  @api templateId;
  /**
   * The folded result list controller responsible for executing the actions of the folded collection.
   * @api
   * @type {FoldedResultList}
   */
  @api foldedResultListController;
  /**
   * The template manager from which to get registered custom templates.
   * @api
   * @type {ResultTemplatesManager}
   */
  @api resultTemplatesManager;

  labels = {
    loadAllResults,
    collapseResults,
    noMoreDocumentsRelated,
  };

  /** @type {boolean} */
  areAllChildResultsLoaded = false;
  /** @type {boolean} */
  areChildResultsExpanded = false;
  /** @type {Array<FoldedResult>} */
  firstChildrenPartition;

  get displayedChildren() {
    if (!this.areAllChildResultsLoaded) {
      return this?.collection?.children ?? [];
    }
    return (
      (this.areChildResultsExpanded
        ? this?.collection?.children
        : this.firstChildrenPartition) ?? []
    );
  }

  get hasChildrenDisplayed() {
    return !!this.displayedChildren.length;
  }

  get isLoadingMoreResults() {
    return this?.collection?.isLoadingMoreResults;
  }

  get areMoreResultsAvailable() {
    return this?.collection?.moreResultsAvailable;
  }

  handleToggleChildResults() {
    if (!this.areAllChildResultsLoaded) {
      this.loadAllFoldedResults();
    } else if (this.areChildResultsExpanded) {
      this.showLessFoldedResults();
    } else if (!this.areChildResultsExpanded) {
      this.showMoreFoldedResults();
    }
  }

  loadAllFoldedResults() {
    this.firstChildrenPartition = this?.collection?.children;
    this.foldedResultListController.loadCollection(this.collection);
    this.areAllChildResultsLoaded = true;
    this.areChildResultsExpanded = true;
  }

  showLessFoldedResults() {
    this.areChildResultsExpanded = false;
    this.foldedResultListController.logShowLessFoldedResults();
  }

  showMoreFoldedResults() {
    this.areChildResultsExpanded = true;
    this.foldedResultListController.logShowMoreFoldedResults(
      this.collection.result
    );
  }

  get toggleChildResultsLabel() {
    if (!this.areChildResultsExpanded) {
      return this.labels.loadAllResults;
    }
    return this.labels.collapseResults;
  }

  get toggleFoldedResultsIcon() {
    if (this.areChildResultsExpanded) {
      return 'utility:chevronup';
    }
    return 'utility:chevrondown';
  }

  get isFirstLevelChildCollection() {
    return this.areMoreResultsAvailable !== undefined;
  }

  get shouldDisplayChildResultsToggle() {
    if (!this.isFirstLevelChildCollection) {
      return false;
    }
    return (
      (this.areAllChildResultsLoaded && this.moreResultsFound) ||
      this.areMoreResultsAvailable
    );
  }

  get moreResultsFound() {
    return (
      this?.collection?.children?.length > this.firstChildrenPartition?.length
    );
  }

  get allFoldedResultsLoadedButNoMoreResults() {
    return this.areAllChildResultsLoaded && !this.moreResultsFound;
  }

  get placeholderCount() {
    return this.firstChildrenPartition?.length || 1;
  }

  get shouldDisplayNoChildrenMessage() {
    if (!this.isFirstLevelChildCollection) {
      return false;
    }
    return (
      this.allFoldedResultsLoadedButNoMoreResults ||
      (!this.areMoreResultsAvailable && !this.areAllChildResultsLoaded)
    );
  }

  render() {
    if (this.isLoadingMoreResults) {
      return loadingTemplate;
    }
    return resultChildrenTemplate;
  }
}
