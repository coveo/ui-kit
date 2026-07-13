import {useCallback, useEffect, useRef, useState} from 'react';

interface Suggestion {
  rawValue: string;
}

interface UseSearchBoxSuggestionsProps {
  /** The query suggestions currently shown, in display order. */
  suggestions: Suggestion[];
  /** Run a search for whatever is currently typed. */
  onSubmit: () => void;
  /** Select (and search) a specific suggestion. */
  onSelect: (rawValue: string) => void;
  /** Optional: preview a suggestion (e.g. refresh instant products). */
  onHighlight?: (rawValue: string) => void;
}

/**
 * Encapsulates the keyboard and focus behavior shared by the search boxes so
 * the components can stay focused on the Coveo controllers:
 *
 *  - open / close the suggestions dropdown,
 *  - ArrowDown / ArrowUp to move through the query suggestions (with wrap),
 *  - Enter to select the highlighted suggestion, or submit when none is,
 *  - Escape to dismiss,
 *  - click / tap outside the search box to close.
 *
 * Attach `rootRef` to the search box wrapper and spread the returned handlers
 * onto the input and suggestion options.
 */
export function useSearchBoxSuggestions({
  suggestions,
  onSubmit,
  onSelect,
  onHighlight,
}: UseSearchBoxSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Index of the keyboard-highlighted suggestion, or -1 when none is active.
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);

  const open = useCallback(() => setIsOpen(true), []);

  const close = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  /** Call when the query text changes: (re)open and drop the highlight. */
  const onInputChange = useCallback(() => {
    setActiveIndex(-1);
    setIsOpen(true);
  }, []);

  const highlight = useCallback(
    (index: number) => {
      setActiveIndex(index);
      const suggestion = suggestions[index];
      if (suggestion) {
        onHighlight?.(suggestion.rawValue);
      }
    },
    [suggestions, onHighlight]
  );

  // Close the dropdown when the user clicks or taps anywhere outside the box.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        close();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isOpen, close]);

  // Keep the highlighted suggestion scrolled into view within the dropdown.
  useEffect(() => {
    if (activeIndex < 0) {
      return;
    }
    rootRef.current
      ?.querySelector(`[data-suggestion-index="${activeIndex}"]`)
      ?.scrollIntoView({block: 'nearest'});
  }, [activeIndex]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (suggestions.length > 0) {
          highlight((activeIndex + 1) % suggestions.length);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (suggestions.length > 0) {
          highlight(
            activeIndex <= 0 ? suggestions.length - 1 : activeIndex - 1
          );
        }
        break;

      case 'Enter': {
        const active = suggestions[activeIndex];
        if (active) {
          onSelect(active.rawValue);
        } else {
          onSubmit();
        }
        close();
        break;
      }

      case 'Escape':
        // Prevent the native "clear" behavior of <input type="search"> so
        // Escape only dismisses the dropdown (keeping the typed query).
        event.preventDefault();
        close();
        break;

      default:
        break;
    }
  };

  return {
    rootRef,
    isOpen,
    activeIndex,
    open,
    close,
    onInputChange,
    highlight,
    onKeyDown,
  };
}
