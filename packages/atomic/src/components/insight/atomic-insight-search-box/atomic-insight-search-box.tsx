import {Component, h, Prop, State} from '@stencil/core';
import {buildInsightSearchBox} from '@coveo/headless/insight';
import {SearchBox, SearchBoxState} from '@coveo/headless';
import {randomID} from '../../../utils/utils';
import {
  BindStateToController,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {Bindings} from '../atomic-insight-interface/atomic-insight-interface';
import {SearchInput} from '../../common/search-box/SearchInput';
import {SearchBoxWrapper} from '../../common/search-box/SearchBoxWrapper';
import {SubmitButton} from '../../common/search-box/SubmitButton';

/**
 *
 * @internal
 */
@Component({
  tag: 'atomic-insight-search-box',
  styleUrl: 'atomic-insight-search-box.pcss',
  shadow: true,
})
export class AtomicInsightSearchBox {
  @InitializeBindings() public bindings!: Bindings;
  @State() public error!: Error;

  private id!: string;
  private searchBox!: SearchBox;
  private inputRef!: HTMLInputElement;

  /**
   * Whether to prevent the user from triggering a search from the component.
   * Perfect for use cases where you need to disable the search conditionally, like when the input is empty.
   */
  @Prop({reflect: true}) public disableSearch = false;

  @BindStateToController('searchBox')
  @State()
  private searchBoxState!: SearchBoxState;

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

  public render() {
    return (
      <SearchBoxWrapper disabled={this.disableSearch}>
        <SearchInput
          inputRef={this.inputRef}
          loading={this.searchBoxState.isLoading}
          ref={(el) => (this.inputRef = el as HTMLInputElement)}
          bindings={this.bindings}
          state={this.searchBoxState}
          searchBox={this.searchBox}
          disabled={this.disableSearch}
          onInput={(e) => {
            this.searchBox.updateText((e.target as HTMLInputElement).value);
          }}
        />
        <SubmitButton
          bindings={this.bindings}
          disabled={this.disableSearch}
          searchBox={this.searchBox}
        />
      </SearchBoxWrapper>
    );
  }
}
