import {LightningElement, track, api} from 'lwc';
import {registerComponentForInit, initializeWithHeadless} from 'c/quanticHeadlessLoader';

export default class QuanticSort extends LightningElement {
  @track state = {};

  /** @type {string} */
  @api engineId;

  /** @type {import("coveo").Sort} */
  sort;
  /** @type {import("coveo").Unsubscribe} */
  unsubscribe;
  /** @type {HTMLElement} */
  combobox;
  /** @type {HTMLElement} */
  relevancyOption;
  /** @type {HTMLElement} */
  newestOption;
  /** @type {HTMLElement} */
  oldestOption;
  /** @type {HTMLElement} */
  checkIcon;
  /** @type {HTMLElement} */
  sortIcon;
  /** @type {HTMLElement} */
  selectedOption;
  /** @type {string} */
  sortMethod;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize.bind(this));
    if(!this.combobox){
      this.combobox = this.template.querySelector('.slds-dropdown-trigger_click');
    }
    if(!this.relevancyOption){
      this.relevancyOption = this.template.querySelectorAll('.slds-listbox__option')[0];
    }
    if(!this.newestOption){
      this.newestOption = this.template.querySelectorAll('.slds-listbox__option')[1];
    }
    if(!this.oldestOption){
      this.oldestOption = this.template.querySelectorAll('.slds-listbox__option')[2];
    }
    if(!this.sortIcon){
      this.sortIcon = this.template.querySelector('.combobox__sort-icon-container');
    }
    if(!this.checkIcon){
      this.checkIcon = this.template.querySelector('.combobox__check-icon-container');
    }
    if(!this.selectedOption){
      this.selectedOption = this.relevancyOption;
      this.selectedOption.classList.add('slds-is-selected');
      this.relevancyOption.children[0].children[0].classList.remove('slds-hidden');
      this.relevancyOption.setAttribute("aria-checked", "true");
      this.relevancyOption.setAttribute("aria-selected", "true");
    }
    if(!this.sortMethod){
      this.sortMethod = 'Sort By';
    }
  }

  /**
   * @param {import("coveo").SearchEngine} engine
   */
  @api
  initialize(engine) {
    this.sort = CoveoHeadless.buildSort(engine);
    this.unsubscribe = this.sort.subscribe(() => this.updateState());
  }

  updateState() {
    this.state = this.sort.state;
  }

  /**
   * @param {MouseEvent} event
   */
  handleSelection(event){
    event.preventDefault();
    const selected = event.target.innerText;
    
    this.selectedOption.classList.remove('slds-is-selected');
    this.selectedOption.setAttribute("aria-checked", "false");
    this.selectedOption.setAttribute("aria-selected", "false");
    this.newestOption.children[0].children[0].classList.add('slds-hidden');
    this.relevancyOption.children[0].children[0].classList.add('slds-hidden');
    this.oldestOption.children[0].children[0].classList.add('slds-hidden');
    
    switch(selected){
      case 'Relevancy':
        this.sortMethod = 'Relevancy';
        this.selectedOption = this.relevancyOption;
        this.sort.sortBy(this.relevance);
        break;
      case 'Newest':
        this.sortMethod = 'Newest';
        this.selectedOption = this.newestOption;
        this.sort.sortBy(this.dateDescending);
        break;
      case 'Oldest':
        this.sortMethod = 'Oldest';
        this.selectedOption = this.oldestOption;
        this.sort.sortBy(this.dateAscending);
        break;
      default:
        break;
    }
    this.selectedOption.classList.add('slds-is-selected');
    this.selectedOption.setAttribute("aria-checked", "true");
    this.selectedOption.setAttribute("aria-selected", "true");
    this.selectedOption.children[0].children[0].classList.remove('slds-hidden');
    this.closeListbox();
  }

  onMouseOver(){
    this.checkIcon.classList.add('combobox__blue-icon', 'slds-current-color');
    this.sortIcon.classList.add('combobox__blue-icon', 'slds-current-color');
  }

  onMouseOut(){
    this.checkIcon.classList.remove('combobox__blue-icon', 'slds-current-color');
    this.sortIcon.classList.remove('combobox__blue-icon', 'slds-current-color');
  }

  openListbox(){
    this.combobox.classList.add('slds-is-open');
  }

  closeListbox(){
    this.combobox.classList.remove('slds-is-open');
  }

  get relevance() {
    return CoveoHeadless.buildRelevanceSortCriterion();
  }

  get dateDescending() {
    return CoveoHeadless.buildDateSortCriterion(CoveoHeadless.SortOrder.Descending)
  }
  
  get dateAscending() {
    return CoveoHeadless.buildDateSortCriterion(CoveoHeadless.SortOrder.Ascending)
  }

  get largest() {
    return CoveoHeadless.buildFieldSortCriterion('size', CoveoHeadless.SortOrder.Descending)
  }

  get options() {
    return [
      {label: 'Relevancy', value: 'relevancy'},
      {label: 'Newest', value: 'newest'},
      {label: 'Oldest', value: 'oldest'},
    ];
  }

  get value() {
    if (!this.sort) {
      return 'relevancy';
    }
    return this.state.sortCriteria.expression;
  }
}
