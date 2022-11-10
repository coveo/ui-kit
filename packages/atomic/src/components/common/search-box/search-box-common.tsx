import {hasKeyboard, isMacOS} from '../../../utils/device-utils';
import {SearchBoxSuggestionElement} from '../../search/search-box-suggestions/suggestions-common';
import {SearchBoxCommonProps} from './search-box-common-interface';

export class SearchBoxCommon {
  constructor(private props: SearchBoxCommonProps) {}

  public get popupId() {
    return `${this.props.id}-popup`;
  }

  public get hasSuggestions() {
    return !!this.props.getSuggestionElements().length;
  }

  public get hasActiveDescendant() {
    return this.props.getActiveDescendant() !== '';
  }

  public get firstValue() {
    return this.props.getPanelInFocus()?.firstElementChild;
  }

  public get lastValue() {
    return this.props.getPanelInFocus()?.lastElementChild;
  }

  public get nextOrFirstValue() {
    if (!this.hasActiveDescendant) {
      return this.firstValue;
    }

    return (
      this.props.getActiveDescendantElement()?.nextElementSibling ||
      this.firstValue
    );
  }

  public get previousOrLastValue() {
    if (!this.hasActiveDescendant) {
      return this.lastValue;
    }

    return (
      this.props.getActiveDescendantElement()?.previousElementSibling ||
      this.lastValue
    );
  }

  public get showSuggestions() {
    return (
      this.hasSuggestions &&
      this.props.getIsExpanded() &&
      !this.props.disableSearch
    );
  }

  public scrollActiveDescendantIntoView() {
    this.props.getActiveDescendantElement()?.scrollIntoView({
      block: 'nearest',
    });
  }

  public focusNextValue() {
    if (!this.hasSuggestions || !this.nextOrFirstValue) {
      return;
    }

    this.props.focusValue(this.nextOrFirstValue as HTMLElement);
  }

  public focusPreviousValue() {
    if (!this.hasSuggestions || !this.previousOrLastValue) {
      return;
    }

    this.props.focusValue(this.previousOrLastValue as HTMLElement);
  }

  public updateQuery(query: string) {
    this.props.bindings.engine.dispatch(
      this.props.querySetActions.updateQuerySetQuery({
        id: this.props.id,
        query,
      })
    );
  }

  public onSuggestionClick(item: SearchBoxSuggestionElement, e: Event) {
    item.onSelect && item.onSelect(e);
    item.query && this.props.clearSuggestions();
  }

  public getSearchInputLabel() {
    if (isMacOS()) {
      return this.props.bindings.i18n.t('search-box-with-suggestions-macos');
    }
    if (!hasKeyboard()) {
      return this.props.bindings.i18n.t(
        'search-box-with-suggestions-keyboardless'
      );
    }
    return this.props.bindings.i18n.t('search-box-with-suggestions');
  }
}
