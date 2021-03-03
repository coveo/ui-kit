import {LightningElement, api, track} from 'lwc';
import TributePath from '@salesforce/resourceUrl/tributejs';
// @ts-ignore
import {loadScript} from 'lightning/platformResourceLoader';
import {registerComponentForInit, initializeWithHeadless} from 'c/headlessLoader';

export default class SearchBox extends LightningElement {
  /** @type {import("coveo").SearchBoxState} */
  @track state = {
    // @ts-ignore TODO: Check SearchBoxState typing and integration with LWC/Quantic
    redirectTo: '',
    suggestions: [],
    value: '',
  };
  /** @type {any} */
  @track suggestions = [];

  /** @type {boolean} */
  @api sample = false;
  /** @type {string} */
  @api searchInterfaceId;

  /** @type {import("coveo").SearchBox} */
  searchBox;
  /** @type {import("coveo").Unsubscribe} */
  unsubscribe;
  tributeLoaded = false;
  /** @type {any} */
  tribute;

  constructor() {
    super();
    registerComponentForInit(this, 'sample-app');
  }

  connectedCallback() {
    initializeWithHeadless(this, this.searchInterfaceId, this.initialize.bind(this));

    if (this.tributeLoaded) {
      return;
    }

    loadScript(this, TributePath + '/tribute.js').then(
      () => (this.tributeLoaded = true)
    );
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  renderedCallback() {
    // @ts-ignore
    const input = this.template.querySelector('input');
    // @ts-ignore
    const wrapper = this.template.querySelector('.slds-dropdown');
    // @ts-ignore
    const combobox = this.template.querySelector('.slds-combobox');

    if (!input || !wrapper || !this.tributeLoaded || this.tribute) {
      return;
    }

    this.configureTributeJS(input, wrapper, combobox);
  }

  /**
   * @param {import("lwc").HTMLElementTheGoodPart} input
   * @param {import("lwc").HTMLElementTheGoodPart} wrapper
   * @param {import("lwc").HTMLElementTheGoodPart} combobox
   */
  configureTributeJS(input, wrapper, combobox) {
    const tributeOptions = {
      values: [],
      searchOpts: {
        skip: true,
      },
      selectTemplate: (item) => item.string,
      menuContainer: wrapper,
      positionMenu: false,
      autocompleteMode: true,
      replaceTextSuffix: '',
      containerClass: 'slds-listbox slds-listbox_vertical',
      itemClass:
        'slds-listbox__item slds-media slds-listbox__option slds-listbox__option_plain slds-media_small',
      noMatchTemplate: '',
    };
    // @ts-ignore
    this.tribute = new Tribute(tributeOptions);
    this.tribute.attach(input);

    input.addEventListener(
      'tribute-replaced',
      /**
       * @param {CustomEvent} e
       */
      (e) => {
        this.searchBox.updateText(e.detail.item.string);
        this.searchBox.submit();
      }
    );

    input.addEventListener('tribute-active-true', () => {
      combobox.classList.add('slds-is-open');
    });

    input.addEventListener('tribute-active-false', () => {
      combobox.classList.remove('slds-is-open');
    });
  }

  /**
   * @param {import("coveo").Engine} engine
   */
  @api
  initialize(engine) {
    this.searchBox = CoveoHeadless.buildSearchBox(engine);
    this.unsubscribe = this.searchBox.subscribe(() => this.updateState());
  }

  /**
   * @param {InputEvent & {target: {value : string}}} event
   */
  onChange(event) {
    this.searchBox.updateText(event.target.value);
  }

  /**
   * @param {KeyboardEvent & {target: {value : string}}} event
   */
  onKeyup(event) {
    if (event.which === 13) {
      this.searchBox.submit();
    }
    this.searchBox.updateText(event.target.value);
  }

  updateState() {
    this.state = this.searchBox.state;

    this.suggestions = this.state.suggestions.map((s) => s.rawValue);
    if (!this.tribute) {
      return;
    }

    this.tribute.append(
      0,
      this.state.suggestions.map((s) => ({key: s.rawValue, value: s.rawValue})),
      true
    );
  }

  onFocus() {
    this.searchBox.showSuggestions();
  }
}
