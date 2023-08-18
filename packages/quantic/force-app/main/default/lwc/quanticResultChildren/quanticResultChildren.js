import hideRelatedItems from '@salesforce/label/c.quantic_HideRelatedItems';
import loadRelatedItems from '@salesforce/label/c.quantic_LoadRelatedItems';
import noRelatedItems from '@salesforce/label/c.quantic_NoRelatedItems';
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
    loadRelatedItems,
    hideRelatedItems,
    noRelatedItems,
  };

  /** @type {boolean} */
  areAllChildResultsLoaded = false;
  /** @type {boolean} */
  _areChildResultsExpanded = false;
  /** @type {Array<FoldedResult>} */
  firstChildrenPartition;

  get displayedChildren() {
    if (!this.areAllChildResultsLoaded || this.areChildResultsExpanded) {
      return this?.collection?.children;
    }
    return this.firstChildrenPartition;
  }

  get shouldDisplayChildren() {
    return !!this.displayedChildren.length;
  }

  get areMoreResultsAvailable() {
    return this?.collection?.moreResultsAvailable;
  }

  get areChildResultsExpanded() {
    return this._areChildResultsExpanded && !this.areMoreResultsAvailable;
  }

  handleToggleChildResults() {
    if (this.areChildResultsExpanded) {
      this.showLessFoldedResults();
    } else {
      this.showMoreFoldedResults();
    }
  }

  loadAllFoldedResults() {
    this.firstChildrenPartition = this?.collection?.children ?? [];
    this.foldedResultListController.loadCollection(this.collection);
    this.areAllChildResultsLoaded = true;
  }

  showLessFoldedResults() {
    this._areChildResultsExpanded = false;
    this.foldedResultListController.logShowLessFoldedResults();
  }

  showMoreFoldedResults() {
    this._areChildResultsExpanded = true;
    if (this.areMoreResultsAvailable) {
      this.loadAllFoldedResults();
    } else {
      this.foldedResultListController.logShowMoreFoldedResults(
        this.collection.result
      );
    }
  }

  get toggleChildResultsLabel() {
    if (!this.areChildResultsExpanded) {
      return this.labels.loadRelatedItems;
    }
    return this.labels.hideRelatedItems;
  }

  get toggleFoldedResultsIcon() {
    if (this.areChildResultsExpanded) {
      return 'utility:chevronup';
    }
    return 'utility:chevrondown';
  }

  get isFirstLevelChildCollection() {
    // Only the first level collection contains the property "areMoreResultsAvailable".
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
      this.numberOfChildResults(this?.collection.children) >
      this.numberOfChildResults(this.firstChildrenPartition)
    );
  }

  /**
   * Returns the children count of a given child results.
   * @param {Array<FoldedResult>} children
   * @returns {number}
   */
  numberOfChildResults(children) {
    if (!children.length) {
      return 0;
    }
    return (
      children.length +
      children.reduce(
        (accumulator, currentValue) =>
          accumulator + this.numberOfChildResults(currentValue.children),
        0
      )
    );
  }

  get placeholderCount() {
    return this.firstChildrenPartition?.length || 1;
  }

  get shouldDisplayNoChildrenMessage() {
    if (!this.isFirstLevelChildCollection) {
      return false;
    }
    return (
      this.areAllChildResultsLoaded &&
      !this.moreResultsFound &&
      !this.areMoreResultsAvailable
    );
  }

  render() {
    if (this?.collection?.isLoadingMoreResults) {
      return loadingTemplate;
    }
    return resultChildrenTemplate;
  }
}
