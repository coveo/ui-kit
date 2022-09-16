import {Component, h, Prop, State} from '@stencil/core';
import {randomID} from '../../../utils/utils';
import {
  BindStateToController,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';
import {SearchInput} from '../../common/search-box/search-input';
import {SearchBoxWrapper} from '../../common/search-box/search-box-wrapper';
import {
  buildInsightSearchBox,
  InsightSearchBox,
  InsightSearchBoxState,
} from '..';
import SearchIcon from 'coveo-styleguide/resources/icons/svg/search.svg';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-search-box',
  styleUrl: 'atomic-insight-search-box.pcss',
  shadow: true,
})
export class AtomicInsightSearchBox {
  @InitializeBindings() public bindings!: InsightBindings;
  @State() public error!: Error;

  private id!: string;
  private searchBox!: InsightSearchBox;
  private inputRef!: HTMLInputElement;

  /**
   * Whether to prevent the user from triggering a search from the component.
   * Perfect for use cases where you need to disable the search conditionally, like when the input is empty.
   */
  @Prop({reflect: true}) public disableSearch = false;

  @BindStateToController('searchBox')
  @State()
  private searchBoxState!: InsightSearchBoxState;

  public initialize() {
    this.id = randomID('atomic-search-box-');

    const searchBoxOptions = {
      id: this.id,
      numberOfSuggestions: 0,
      highlightOptions: {
        notMatchDelimiters: {
          open: '<span class="font-bold">',
          close: '</span>',
        },
        correctionDelimiters: {
          open: '<span class="font-normal">',
          close: '</span>',
        },
      },
    };
    this.searchBox = buildInsightSearchBox(this.bindings.engine, {
      options: searchBoxOptions,
    });
  }

  private onKeyDown(e: KeyboardEvent) {
    if (this.disableSearch) {
      return;
    }

    switch (e.key) {
      case 'Enter':
        this.searchBox.submit();
        break;
    }
  }

  public render() {
    return (
      <SearchBoxWrapper disabled={this.disableSearch}>
        <atomic-icon
          part="submit-icon"
          icon={SearchIcon}
          class="w-4 h-4"
        ></atomic-icon>
        <SearchInput
          inputRef={this.inputRef}
          loading={this.searchBoxState.isLoading}
          ref={(el) => (this.inputRef = el as HTMLInputElement)}
          bindings={this.bindings}
          value={this.searchBoxState.value}
          ariaLabel={this.bindings.i18n.t('search-box')}
          placeholder={this.bindings.i18n.t('search-ellipsis')}
          onKeyDown={(e) => this.onKeyDown(e)}
          onClear={() => this.searchBox.clear()}
          onInput={(e) => {
            this.searchBox.updateText((e.target as HTMLInputElement).value);
          }}
        />
      </SearchBoxWrapper>
    );
  }
}
