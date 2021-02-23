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

  public set text(text: string) {
    this.state.facetSearchQuery = text;
    this.facetSearch.updateText(text);
    this.facetSearch.search();
  }
}

export type FacetSearchProps = {
  controller: FacetSearchController;
  placeholder?: string;
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
        this.props.controller.facetSearch.select(
          this.props.controller.facetSearchState.values[
            index
          ] as CategoryFacetSearchResult
        );
      },
      onBlur: () => {
        props.controller.state.showFacetSearchResults = false;
      },
      activeClass: 'active',
      activePartName: 'active-suggestion',
    });
  }

  public updateCombobox() {
    this.combobox.updateAccessibilityAttributes();
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
        onFocus={() => {
          this.props.controller.state.showFacetSearchResults = true;
        }}
        onBlur={() => this.combobox.onInputBlur()}
        onInput={(e) => this.combobox.onInputChange(e)}
        onKeyUp={(e) => this.combobox.onInputKeyup(e)}
        onKeyDown={(e) => this.combobox.onInputKeydown(e)}
        type="text"
        class={'search-input flex-grow outline-none focus:outline-none mx-2'}
        placeholder={this.props.placeholder}
        value={this.props.controller.state.facetSearchQuery}
      />
    );
  }

  private get suggestions() {
    return (this.props.controller.facetSearchState
      .values as BaseFacetSearchResult[]).map((suggestion, index) => {
      return (
        <li
          onClick={() =>
            this.props.controller.facetSearch.select(
              suggestion as CategoryFacetSearchResult
            )
          }
          onMouseDown={(e) => e.preventDefault()}
          part="suggestion"
          class="suggestion cursor-pointer flex flex-row items-center px-2 text-sm"
          value={index}
        >
          <span class="label font-semibold whitespace-nowrap overflow-ellipsis overflow-hidden">
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
        onClick={() => this.props.controller.state.facet.showMoreValues()}
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
          'suggestions absolute w-full bg-background border-on-background-variant apply-border-on-background empty:border-none rounded-b border-t-0 ' +
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
      'input-wrapper flex flex-grow items-center border-on-background-variant apply-border-on-background rounded ' +
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
          {this.input}
          {this.clearButton}
        </div>
        {this.suggestionList}
      </div>
    );
  }
}
