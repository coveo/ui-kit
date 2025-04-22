import {
  FunctionalComponent,
  FunctionalComponentOutput,
} from '@/src/utils/functional-component-utils';
import {i18n} from 'i18next';
import {html, nothing} from 'lit';
import {classMap} from 'lit/directives/class-map.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {keyed} from 'lit/directives/keyed.js';
import {RefOrCallback} from 'lit/directives/ref.js';
import {ref} from 'lit/directives/ref.js';
import {isMacOS} from '../../../utils/device-utils';
import {SearchBoxSuggestionElement} from '../suggestions/suggestions-common';

type Side = 'left' | 'right';

interface SearchSuggestionProps {
  i18n: i18n;
  id: string;
  suggestion: SearchBoxSuggestionElement;
  isSelected: boolean;
  side: Side;
  index: number;
  lastIndex: number;
  isDoubleList: boolean;
}

interface ButtonSearchSuggestionProps extends SearchSuggestionProps {
  onClick?(e: Event): void;
  onMouseOver?(e: Event): void;
}

function getPartsForSuggestion(
  suggestion: SearchBoxSuggestionElement,
  isSelected: boolean
) {
  let part = 'suggestion';
  if (isSelected) {
    part += ' active-suggestion';
  }
  if (suggestion.query) {
    part += ' suggestion-with-query';
  }
  if (suggestion.part) {
    part += ` ${suggestion.part}`;
  }
  return part;
}

function getClassesForSuggestion(isSelected: boolean) {
  const classes = {
    'flex px-4 min-h-10 items-center text-left text-neutral-dark cursor-pointer':
      true,
    'bg-neutral-light': isSelected,
  };
  return classMap(classes);
}

function isHTMLElement(
  el: FunctionalComponentOutput | Element
): el is HTMLElement {
  return el instanceof HTMLElement;
}

function ensureContentForRenderedSuggestion({
  renderedSuggestion,
  suggestion,
}: {
  renderedSuggestion: HTMLElement;
  suggestion: SearchBoxSuggestionElement;
}) {
  if (isHTMLElement(suggestion.content)) {
    renderedSuggestion.replaceChildren(suggestion.content);
  }
}

function getAriaLabelForRenderedSuggestion({
  i18n,
  renderedSuggestion,
  suggestion,
  side,
  index,
  lastIndex,
  isDoubleList,
  isButton,
}: {
  i18n: i18n;
  renderedSuggestion: HTMLElement;
  suggestion: SearchBoxSuggestionElement;
  side: Side;
  index: number;
  lastIndex: number;
  isDoubleList: boolean;
  isButton: boolean;
}) {
  const contentLabel =
    suggestion.ariaLabel ??
    suggestion.query ??
    renderedSuggestion.innerText ??
    i18n.t('no-title');

  const labelWithType =
    isMacOS() && isButton
      ? i18n.t('search-suggestion-button', {
          label: contentLabel,
          interpolation: {escapeValue: false},
        })
      : contentLabel;
  const position = index + 1;
  const count = lastIndex + 1;

  if (!isDoubleList) {
    return i18n.t('search-suggestion-single-list', {
      label: labelWithType,
      position,
      count,
      interpolation: {escapeValue: false},
    });
  }

  return i18n.t('search-suggestion-double-list', {
    label: labelWithType,
    position,
    count,
    side: i18n.t(side === 'left' ? 'left' : 'right'),
    interpolation: {escapeValue: false},
  });
}

function getContentForSuggestion(suggestion: SearchBoxSuggestionElement) {
  return !isHTMLElement(suggestion.content) ? suggestion.content : nothing;
}

export const simpleSearchSuggestion: FunctionalComponent<
  SearchSuggestionProps
> = ({
  props: {
    id,
    suggestion,
    isSelected,
    i18n,
    side,
    index,
    lastIndex,
    isDoubleList,
  },
}) => {
  const refCallback: RefOrCallback<HTMLElement> = (
    el: HTMLElement | undefined
  ) => {
    if (!el) {
      return;
    }
    ensureContentForRenderedSuggestion({
      renderedSuggestion: el,
      suggestion,
    });
    el.setAttribute(
      'aria-label',
      getAriaLabelForRenderedSuggestion({
        i18n,
        renderedSuggestion: el,
        suggestion,
        side,
        index,
        lastIndex,
        isDoubleList,
        isButton: false,
      })
    );
  };
  return keyed(
    suggestion.key,
    html`<span
      id=${id}
      part=${getPartsForSuggestion(suggestion, isSelected)}
      class=${getClassesForSuggestion(isSelected)}
      ${ref(refCallback as RefOrCallback<Element>)}
      >${getContentForSuggestion(suggestion)}</span
    >`
  );
};

export const buttonSearchSuggestion: FunctionalComponent<
  ButtonSearchSuggestionProps
> = ({
  props: {
    id,
    suggestion,
    isSelected,
    i18n,
    side,
    index,
    lastIndex,
    isDoubleList,
    onClick,
    onMouseOver,
  },
}) => {
  const refCallback: RefOrCallback<HTMLElement> = (
    el: HTMLElement | undefined
  ) => {
    if (!el) {
      return;
    }
    ensureContentForRenderedSuggestion({
      renderedSuggestion: el,
      suggestion,
    });
    el.setAttribute(
      'aria-label',
      getAriaLabelForRenderedSuggestion({
        i18n,
        renderedSuggestion: el,
        suggestion,
        side,
        index,
        lastIndex,
        isDoubleList,
        isButton: true,
      })
    );
  };
  return keyed(
    suggestion.key,
    html`<button
      id=${id}
      part=${getPartsForSuggestion(suggestion, isSelected)}
      class=${getClassesForSuggestion(isSelected)}
      ${ref(refCallback as RefOrCallback<Element>)}
      @mousedown=${(e: MouseEvent) => e.preventDefault()}
      @click=${(e: MouseEvent) => onClick?.(e)}
      @mouseover=${(e: MouseEvent) => onMouseOver?.(e)}
      data-query=${ifDefined(suggestion.query)}
    >
      ${getContentForSuggestion(suggestion)}
    </button>`
  );
};
