import {h} from '@stencil/core';

import ClearIcon from 'coveo-styleguide/resources/icons/svg/clear.svg';
import {Combobox} from '../../../utils/combobox';
import {I18nState} from '../../../utils/initialization-utils';
import {
  CategoryFacet,
  CategoryFacetState,
  Facet,
  FacetState,
} from '@coveo/headless';
import {BaseFacetSearchResult} from '@coveo/headless/dist/api/search/facet-search/base/base-facet-search-response';
import {randomID} from '../../../utils/utils';
import {CategoryFacetSearchResult} from '@coveo/headless/dist/api/search/facet-search/category-facet-search/category-facet-search-response';
import SearchIcon from 'coveo-styleguide/resources/icons/svg/search.svg';

export interface FacetSearchState {
  strings: I18nState;
  facetSearchQuery: string;
  showFacetSearchResults: boolean;
  facet: Facet | CategoryFacet;
  facetState: FacetState | CategoryFacetState;
}

export class FacetSearchController {
  constructor(public state: FacetSearchState) {}

  public get facetSearch() {
    return this.state.facet.facetSearch;
  }

  public get facetSearchState() {
    return this.state.facetState.facetSearch;
  }

  public get strings() {
    return this.state.strings;
  }

  public set text(text: string) {
    this.state.facetSearchQuery = text;
    this.facetSearch.updateText(text);
    this.facetSearch.search();
  }
}

export type FacetSearchProps = {
  controller: FacetSearchController;
};

export class FacetSearch {
  private inputRef!: HTMLInputElement;
  private valuesRef!: HTMLElement;
  private containerRef!: HTMLElement;
  private combobox: Combobox;

  constructor(private props: FacetSearchProps) {
    this.combobox = new Combobox({
      id: randomID('facet-search'),
      strings: props.controller.state.strings,
      containerRef: () => this.containerRef,
      inputRef: () => this.inputRef,
      valuesRef: () => this.valuesRef,
      onChange: (value) => {
        this.props.controller.text = value;
      },
      onSubmit: () => props.controller.facetSearch.search(),
      onSelectValue: (element) => {
        const index = (element as HTMLLIElement).value;
        this.onSelectValue(
          this.props.controller.facetSearchState.values[index]
        );
      },
      onBlur: () => {
        props.controller.state.showFacetSearchResults = false;
      },
      activeClass: 'active',
      activePartName: 'active-suggestion',
    });
  }

  private onSelectValue(value: BaseFacetSearchResult) {
    this.props.controller.facetSearch.select(
      value as CategoryFacetSearchResult
    );
    this.combobox.onInputBlur();
  }

  public updateCombobox() {
    this.combobox.updateAccessibilityAttributes();
  }

  private onFocus() {
    this.props.controller.state.showFacetSearchResults = true;
    if (this.props.controller.facetSearchState.values.length === 0) {
      this.props.controller.facetSearch.search();
    }
  }

  private get clearButton() {
    if (this.props.controller.state.facetSearchQuery === '') {
      return null;
    }
    return (
      <button
        type="button"
        part="clear-button"
        class="clear-button mr-2"
        onClick={() => {
          this.props.controller.text = '';
          this.inputRef.focus();
        }}
      >
        <div
          innerHTML={ClearIcon}
          class="text-on-background fill-current h-2.5 w-2.5"
        />
      </button>
    );
  }

  private get input() {
    return (
      <input
        part="search-input"
        ref={(el) => (this.inputRef = el as HTMLInputElement)}
        onFocus={() => this.onFocus()}
        onBlur={() => this.combobox.onInputBlur()}
        onInput={(e) => this.combobox.onInputChange(e)}
        onKeyUp={(e) => this.combobox.onInputKeyup(e)}
        onKeyDown={(e) => this.combobox.onInputKeydown(e)}
        type="text"
        class={
          'search-input placeholder-on-background-variant flex-grow outline-none focus:outline-none mx-2'
        }
        placeholder={this.props.controller.strings.placeholder()}
        value={this.props.controller.state.facetSearchQuery}
      />
    );
  }

  private get suggestions() {
    return (this.props.controller.facetSearchState
      .values as BaseFacetSearchResult[]).map((suggestion, index) => {
      return (
        <li
          onClick={() => this.onSelectValue(suggestion)}
          onMouseDown={(e) => e.preventDefault()}
          part="suggestion"
          class="suggestion cursor-pointer flex flex-row items-center px-2 text-sm"
          value={index}
        >
          <span class="label whitespace-nowrap overflow-ellipsis overflow-hidden">
            {suggestion.rawValue}
          </span>
          <span class="number-of-values ml-auto text-on-background-variant">
            {suggestion.count}
          </span>
        </li>
      );
    });
  }

  private get showMoreSearchResults() {
    if (this.props.controller.facetSearchState.values.length === 0) {
      return null;
    }

    return (
      <button
        class="px-1 text-primary"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => this.props.controller.facetSearch.showMoreResults()}
      >
        show more
      </button>
    );
  }

  private get suggestionList() {
    const showResults = this.props.controller.state.showFacetSearchResults;
    return (
      <ul
        part="suggestions"
        class={
          'suggestions z-10 absolute w-full bg-background border-divider apply-border-on-background empty:border-none rounded-b border-t-0 ' +
          (showResults ? 'block' : 'hidden')
        }
        ref={(el) => (this.valuesRef = el as HTMLElement)}
      >
        {this.suggestions}
        {this.showMoreSearchResults}
      </ul>
    );
  }

  private get inputWrapperClasses() {
    const hasValues =
      this.props.controller.facetSearchState.values.length > 0 &&
      this.props.controller.state.showFacetSearchResults;

    return (
      'input-wrapper flex flex-grow items-center border-divider apply-border-on-background rounded ' +
      (hasValues ? 'has-values' : '')
    );
  }

  public render() {
    return (
      <div class="combobox relative flex flex-grow">
        <div
          class={this.inputWrapperClasses}
          ref={(el) => (this.containerRef = el as HTMLElement)}
        >
          <div
            class={'ml-2 w-3 h-3 text-on-background-variant fill-current'}
            innerHTML={SearchIcon}
          />
          {this.input}
          {this.clearButton}
        </div>
        {this.suggestionList}
      </div>
    );
  }
}
