import {LightningElement, api} from 'lwc';

export default class QuanticCarousel extends LightningElement {
  /**
   * The current page number.
   * @api
   * @type {number}
   */
  @api currentPage = 0;
  /**
   * The total number of pages.
   * @api
   * @type {number}
   */
  @api numberOfPages;

  handlePrevious() {
    this.dispatchChangePageEvent(this.currentPage - 1);
  }

  handleNext() {
    this.dispatchChangePageEvent(this.currentPage + 1);
  }

  dispatchChangePageEvent(newPageNumber) {
    const changePageEvent = new CustomEvent('changepage', {
      detail: {
        page: newPageNumber,
      },
    });
    this.dispatchEvent(changePageEvent);
  }

  get previousButtonIsDisabled() {
    return this.currentPage === 0;
  }

  get nextButtonIsDisabled() {
    return this.currentPage === this.numberOfPages - 1;
  }
}
