import {I18nState} from './initialization-utils';

export interface ComboboxStrings extends I18nState {
  searchBox: () => string;
  querySuggestionList: () => string;
}

export interface ComboboxOptions {
  id: string;
  strings: ComboboxStrings;
  containerRef: () => HTMLElement;
  inputRef: () => HTMLInputElement;
  valuesRef: () => HTMLElement;
  onSubmit: () => void;
  onSelectValue: (element: Element) => void;
  onBlur: () => void;
  onChange: (value: string) => void;
  activeClass: string;
  activePartName: string;
}

export class Combobox {
  private activeDescendant = '';
  constructor(private options: ComboboxOptions) {}

  public onInputChange(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    this.options.onChange(value);
  }

  public onInputKeyup(e: KeyboardEvent) {
    switch (e.key) {
      case 'Enter':
        this.onSubmit();
        break;
      case 'Escape':
        this.onInputBlur();
        break;
    }
  }

  private onSubmit() {
    const activeDescendantElement =
      this.hasActiveDescendant && this.activeDescendantElement;

    this.updateActiveDescendant();

    if (activeDescendantElement) {
      this.options.onSelectValue(activeDescendantElement);
      return;
    }
    this.options.onSubmit();
  }

  public onInputKeydown(e: KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.focusNextValue();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.focusPreviousValue();
        break;
    }
  }

  public onInputBlur() {
    this.updateActiveDescendant();
    this.options.onBlur();
  }

  private updateActiveDescendantElement(
    activeDescendantElement: Element | null | undefined
  ) {
    if (!activeDescendantElement) {
      return;
    }

    this.updateActiveDescendant(activeDescendantElement.id);
  }

  private updateActiveDescendant(activeDescendant = '') {
    this.activeDescendant = activeDescendant;
  }

  private get activeDescendantElement() {
    return this.listbox.querySelector(`#${this.activeDescendant}`);
  }

  private get hasActiveDescendant() {
    return this.activeDescendant !== '';
  }

  private get hasValues() {
    return !!this.listbox.childElementCount;
  }

  private focusNextValue() {
    if (!this.hasValues) {
      return;
    }

    this.updateActiveDescendantElement(this.nextOfFirstValue);
    this.updateAccessibilityAttributes();
  }

  private get firstValue() {
    return this.listbox.firstElementChild;
  }

  private get nextOfFirstValue() {
    if (!this.hasActiveDescendant) {
      return this.firstValue;
    }

    return this.activeDescendantElement?.nextElementSibling || this.firstValue;
  }

  private focusPreviousValue() {
    if (!this.hasValues) {
      return;
    }

    this.updateActiveDescendantElement(this.previousOrLastValue);
    this.updateAccessibilityAttributes();
  }

  private get lastValue() {
    return this.listbox.lastElementChild;
  }

  private get previousOrLastValue() {
    if (!this.hasActiveDescendant) {
      return this.lastValue;
    }
    return (
      this.activeDescendantElement?.previousElementSibling || this.lastValue
    );
  }

  private get container() {
    return this.options.containerRef();
  }

  private get textbox() {
    return this.options.inputRef();
  }

  private get listbox() {
    return this.options.valuesRef();
  }

  private get listboxOptions() {
    return this.options.valuesRef().children;
  }

  private get isRendered() {
    return this.container && this.textbox && this.listbox;
  }

  public updateAccessibilityAttributes() {
    if (!this.isRendered) {
      return;
    }

    this.setAttributes(this.containerAttributes, this.container);
    this.setAttributes(this.textboxAttributes, this.textbox);
    this.setAttributes(this.listboxAttributes, this.listbox);

    Array.from(this.listboxOptions).forEach((value, index) => {
      value.setAttribute('id', `${this.options.id}-suggestion-${index}`);
      this.updateOption(value);
    });
  }

  private updateOption(value: Element) {
    const isActive = value.id === this.activeDescendant;
    this.options.activeClass
      .split(' ')
      .forEach((activeClass) => value.classList.toggle(activeClass, isActive));
    this.setAttributes(this.optionAttributes(isActive, value), value);
  }

  private setAttributes(attributes: Record<string, string>, element: Element) {
    Object.entries(attributes).forEach(([key, value]) =>
      element.setAttribute(key, value)
    );
  }

  private get containerAttributes() {
    return {
      'aria-owns': `${this.options.id}-listbox`,
      role: 'combobox',
      'aria-haspopup': 'listbox',
      'aria-expanded': `${this.hasValues}`,
    };
  }

  private get textboxAttributes() {
    return {
      id: `${this.options.id}-textbox`,
      autocomplete: 'off',
      autocapitalize: 'off',
      autocorrect: 'off',
      'aria-autocomplete': 'list',
      'aria-controls': `${this.options.id}-listbox`,
      'aria-activedescendant': this.activeDescendant,
      'aria-label': this.options.strings.searchBox(),
    };
  }

  private get listboxAttributes() {
    return {
      id: `${this.options.id}-listbox`,
      role: 'listbox',
      'aria-label': this.options.strings.querySuggestionList(),
    };
  }

  private optionAttributes(isActive: boolean, value: Element) {
    const part = value.getAttribute('part') ?? '';
    const activePart = ` ${this.options.activePartName}`;
    return {
      role: 'option',
      'aria-selected': `${isActive}`,
      part: isActive ? `${part}${activePart}` : part.replace(activePart, ''),
    };
  }
}
