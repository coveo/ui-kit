import hideThread from '@salesforce/label/c.quantic_HideThread';
import loadThread from '@salesforce/label/c.quantic_LoadThread';
import noDocumentsRelated from '@salesforce/label/c.quantic_NoDocumentsRelated';
import noMoreDocumentsRelated from '@salesforce/label/c.quantic_NoMoreDocumentsRelated';
import showThread from '@salesforce/label/c.quantic_ShowThread';
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
 * <c-quantic-result-children engine-id={engineId} folded-collection={foldedCollection} template-id="example-template-id" folded-result-list-controller={foldedResultListController} result-templates-manager={resultTemplatesManager}>
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
  @api foldedCollection;
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
    loadThread,
    showThread,
    hideThread,
    noDocumentsRelated,
    noMoreDocumentsRelated,
  };

  /** @type {boolean} */
  areAllFoldedResultsLoaded = false;
  /** @type {boolean} */
  areFoldedResultsExpanded = false;
  /** @type {boolean} */
  foldedResultHasMoreChildren = true;
  /** @type {Array<FoldedResult>} */
  firstChildrenPartition;

  get displayedChildren() {
    if (!this.areAllFoldedResultsLoaded) {
      return this?.foldedCollection?.children ?? [];
    }
    return (
      (this.areFoldedResultsExpanded
        ? this?.foldedCollection?.children
        : this.firstChildrenPartition) ?? []
    );
  }

  get hasChildren() {
    return !!this.displayedChildren.length;
  }

  get isLoadingMoreResults() {
    return this?.foldedCollection?.isLoadingMoreResults;
  }

  get areMoreResultsAvailable() {
    return this?.foldedCollection?.moreResultsAvailable;
  }

  handleToggleFoldedResults() {
    if (!this.areAllFoldedResultsLoaded) {
      this.loadAllFoldedResults();
    } else if (this.areFoldedResultsExpanded) {
      this.showLessFoldedResults();
    } else if (!this.areFoldedResultsExpanded) {
      this.showMoreFoldedResults();
    }
  }

  loadAllFoldedResults() {
    this.firstChildrenPartition = this?.foldedCollection?.children;
    this.foldedResultListController.loadCollection(this.foldedCollection);
    this.areAllFoldedResultsLoaded = true;
    this.areFoldedResultsExpanded = true;
  }

  showLessFoldedResults() {
    this.areFoldedResultsExpanded = false;
    this.foldedResultListController.logShowLessFoldedResults();
  }

  showMoreFoldedResults() {
    this.areFoldedResultsExpanded = true;
    this.foldedResultListController.logShowMoreFoldedResults(
      this.foldedCollection.result
    );
  }

  get toggleFoldedResultsLabel() {
    if (!this.areAllFoldedResultsLoaded) {
      return this.labels.loadThread;
    } else if (!this.areFoldedResultsExpanded) {
      return this.labels.showThread;
    }
    return this.labels.hideThread;
  }

  get noMoreChildResutsMessage() {
    return this?.foldedCollection?.children?.length
      ? this.labels.noMoreDocumentsRelated
      : this.labels.noDocumentsRelated;
  }

  get toggleFoldedResultsIcon() {
    if (this.areFoldedResultsExpanded) {
      return 'utility:chevronup';
    }
    return 'utility:chevrondown';
  }

  get isFirstLevelChildCollection() {
    return this.areMoreResultsAvailable !== undefined;
  }

  get shouldDisplayFoldedResultsToggle() {
    if (!this.isFirstLevelChildCollection) {
      return false;
    }
    return (
      (this.areAllFoldedResultsLoaded && this.moreResultsFound) ||
      this.areMoreResultsAvailable
    );
  }

  get moreResultsFound() {
    return (
      this?.foldedCollection?.children?.length >
      this.firstChildrenPartition?.length
    );
  }

  get allFoldedResultsLoadedButNoMoreResults() {
    return this.areAllFoldedResultsLoaded && !this.moreResultsFound;
  }

  get childResultCount() {
    return this.firstChildrenPartition?.length || 1;
  }

  get shouldDisplayNoChildrenMessage() {
    if (!this.isFirstLevelChildCollection) {
      return false;
    }
    return (
      this.allFoldedResultsLoadedButNoMoreResults ||
      (!this.areMoreResultsAvailable && !this.areAllFoldedResultsLoaded)
    );
  }

  render() {
    if (this.isLoadingMoreResults) {
      return loadingTemplate;
    }
    return resultChildrenTemplate;
  }
}
