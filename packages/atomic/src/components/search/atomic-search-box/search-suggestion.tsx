import {h, FunctionalComponent, VNode, Fragment} from '@stencil/core';
import {JSXBase} from '@stencil/core/internal';
import {isMacOS} from '../../../utils/device-utils';
import {AnyBindings} from '../../common/interface/bindings';
import {SearchBoxSuggestionElement} from '../../common/suggestions/suggestions-common';

export const queryDataAttribute = 'data-query';

type Side = 'left' | 'right';

interface SearchSuggestionProps {
  bindings: AnyBindings;
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
  return `flex px-4 min-h-10 items-center text-left text-neutral-dark cursor-pointer ${
    isSelected ? 'bg-neutral-light' : ''
  }`;
}

function isHTMLElement(el: VNode | Element): el is HTMLElement {
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
  bindings,
  renderedSuggestion,
  suggestion,
  side,
  index,
  lastIndex,
  isDoubleList,
  isButton,
}: {
  bindings: AnyBindings;
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
    bindings.i18n.t('no-title');
  const labelWithType =
    isMacOS() && isButton
      ? bindings.i18n.t('search-suggestion-button', {
          label: contentLabel,
          interpolation: {escapeValue: false},
        })
      : contentLabel;
  const position = index + 1;
  const count = lastIndex + 1;

  if (!isDoubleList) {
    return bindings.i18n.t('search-suggestion-single-list', {
      label: labelWithType,
      position,
      count,
      interpolation: {escapeValue: false},
    });
  }

  return bindings.i18n.t('search-suggestion-double-list', {
    label: labelWithType,
    position,
    count,
    side: bindings.i18n.t(side === 'left' ? 'left' : 'right'),
    interpolation: {escapeValue: false},
  });
}

function getContentForSuggestion(suggestion: SearchBoxSuggestionElement) {
  return !isHTMLElement(suggestion.content) ? (
    suggestion.content
  ) : (
    <Fragment></Fragment>
  );
}

function getCommonSearchSuggestionAttributes(
  {
    bindings,
    id,
    suggestion,
    isSelected,
    side,
    index,
    lastIndex,
    isDoubleList,
  }: SearchSuggestionProps,
  isButton: boolean
): JSXBase.HTMLAttributes<HTMLElement> {
  return {
    id: id,
    key: suggestion.key,
    part: getPartsForSuggestion(suggestion, isSelected),
    class: getClassesForSuggestion(isSelected),
    ref: (el) => {
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
          bindings,
          renderedSuggestion: el,
          suggestion,
          side,
          index,
          lastIndex,
          isDoubleList,
          isButton,
        })
      );
    },
  };
}

export const SimpleSearchSuggestion: FunctionalComponent<
  SearchSuggestionProps
> = (props) => {
  return (
    <span {...getCommonSearchSuggestionAttributes(props, false)}>
      {getContentForSuggestion(props.suggestion)}
    </span>
  );
};

export const ButtonSearchSuggestion: FunctionalComponent<
  ButtonSearchSuggestionProps
> = (props) => {
  return (
    <button
      {...getCommonSearchSuggestionAttributes(props, true)}
      onMouseDown={(e) => e.preventDefault()}
      onClick={(e: Event) => props.onClick?.(e)}
      onMouseOver={(e: Event) => props.onMouseOver?.(e)}
      {...{[queryDataAttribute]: props.suggestion.query}}
    >
      {getContentForSuggestion(props.suggestion)}
    </button>
  );
};
