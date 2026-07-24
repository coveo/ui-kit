import {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  type KeyboardEvent,
  type ChangeEvent,
} from 'react';
import {
  SuggestionsDropdown,
  SUGGESTIONS_LISTBOX_ID,
  type SuggestionSection,
  type SuggestionItem,
} from '../SuggestionsDropdown/index.js';
import styles from './PromptInput.module.css';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
  placeholder?: string;
  initialValue?: string;
  clearOnSubmit?: boolean;
  autoFocus?: boolean;
  suggestions?: SuggestionSection[];
  onSuggestionSelect?: (item: SuggestionItem, sectionId: string) => void;
}

export function PromptInput({
  onSubmit,
  disabled = false,
  placeholder = 'Search for products or ask a question...',
  initialValue = '',
  clearOnSubmit = false,
  autoFocus = false,
  suggestions,
  onSuggestionSelect,
}: PromptInputProps) {
  const [value, setValue] = useState(initialValue);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [pendingSuggestion, setPendingSuggestion] = useState<{
    item: SuggestionItem;
    sectionId: string;
  } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressNextFocusRef = useRef(false);
  const prevInitialValueRef = useRef(initialValue);

  useEffect(() => {
    if (initialValue !== prevInitialValueRef.current) {
      prevInitialValueRef.current = initialValue;
      setValue(initialValue);
    }
  }, [initialValue]);

  const totalItems = useMemo(
    () => (suggestions ? suggestions.flatMap((s) => s.items) : []),
    [suggestions]
  );

  useEffect(() => {
    setActiveIndex(-1);
  }, [suggestions]);

  useEffect(() => {
    if (pendingSuggestion) {
      const {item, sectionId} = pendingSuggestion;
      setPendingSuggestion(null);
      onSuggestionSelect?.(item, sectionId);
    }
  }, [pendingSuggestion, onSuggestionSelect]);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const submit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    setShowDropdown(false);
    onSubmit(trimmed);
    if (clearOnSubmit) {
      setValue('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.overflowY = 'hidden';
      }
    }
  }, [value, disabled, onSubmit, clearOnSubmit]);

  function handleFocus() {
    if (disabled) {
      return;
    }
    if (suppressNextFocusRef.current) {
      suppressNextFocusRef.current = false;
      return;
    }
    if (suggestions && suggestions.length > 0) {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }
      setShowDropdown(true);
      setActiveIndex(-1);
    }
  }

  function handleBlur() {
    blurTimeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, 150);
  }

  function selectItem(index: number) {
    const item = totalItems[index];
    if (item && suggestions) {
      let sectionId = '';
      let count = 0;
      for (const section of suggestions) {
        if (index < count + section.items.length) {
          sectionId = section.id;
          break;
        }
        count += section.items.length;
      }
      setValue(item.label);
      setShowDropdown(false);
      setPendingSuggestion({item, sectionId});
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Escape' && showDropdown) {
      e.preventDefault();
      setShowDropdown(false);
      return;
    }

    if (e.key === 'ArrowDown' && showDropdown) {
      e.preventDefault();
      setActiveIndex((prev) => (prev < totalItems.length - 1 ? prev + 1 : prev));
      return;
    }

    if (e.key === 'ArrowUp' && showDropdown) {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showDropdown && activeIndex >= 0) {
        selectItem(activeIndex);
      } else {
        submit();
      }
      return;
    }
  }

  const supportsFieldSizing = typeof CSS !== 'undefined' && CSS.supports('field-sizing', 'content');

  function handleInput(e: ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    const el = e.target;
    const computed = getComputedStyle(el);
    const maxHeight = parseInt(computed.maxHeight, 10);
    const minHeight = parseInt(computed.minHeight, 10);

    if (!supportsFieldSizing) {
      el.style.height = `${minHeight}px`;
      if (el.scrollHeight > minHeight) {
        el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
      }
    }

    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }

  function handleDropdownSelect(item: SuggestionItem, sectionId: string) {
    setValue(item.label);
    setShowDropdown(false);
    setPendingSuggestion({item, sectionId});
  }

  const activeDescendant =
    showDropdown && activeIndex >= 0 && totalItems[activeIndex]
      ? `suggestion-item-${totalItems[activeIndex].id}`
      : undefined;

  return (
    <div className={styles.wrapper}>
      <div className={styles.inputContainer}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={disabled && !value ? '' : placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          rows={1}
          role="combobox"
          aria-label="Prompt"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-controls={SUGGESTIONS_LISTBOX_ID}
          aria-activedescendant={activeDescendant}
        />
        <button
          type="button"
          className={`${styles.iconButton} ${styles.clearButton}`}
          onClick={() => {
            setValue('');
            setShowDropdown(false);
            suppressNextFocusRef.current = true;
            if (textareaRef.current) {
              textareaRef.current.style.height = 'auto';
              textareaRef.current.style.overflowY = 'hidden';
              textareaRef.current.focus();
            }
          }}
          aria-label="Clear"
          style={{visibility: value && !disabled ? 'visible' : 'hidden'}}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <button
          type="button"
          className={`${styles.iconButton} ${styles.submitButton}`}
          onClick={submit}
          disabled={disabled || !value.trim()}
          aria-label="Submit"
        >
          {disabled ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className={styles.spinner}
            >
              <circle cx="12" cy="12" r="10" opacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M18.5 10C18.4 10 18.3333 9.95 18.3 9.85C18.0333 8.83333 17.525 7.95833 16.775 7.225C16.0417 6.475 15.1667 5.96667 14.15 5.7C14.05 5.66667 14 5.6 14 5.5C14 5.38333 14.05 5.31667 14.15 5.3C15.1667 5.03333 16.0417 4.53333 16.775 3.8C17.525 3.05 18.0333 2.16667 18.3 1.15C18.3333 1.05 18.4 1 18.5 1C18.6167 1 18.6833 1.05 18.7 1.15C18.9833 2.16667 19.4917 3.05 20.225 3.8C20.9583 4.53333 21.8333 5.03333 22.85 5.3C22.95 5.31667 23 5.38333 23 5.5C23 5.6 22.95 5.66667 22.85 5.7C21.8333 5.96667 20.95 6.475 20.2 7.225C19.4667 7.95833 18.9667 8.83333 18.7 9.85C18.6833 9.95 18.6167 10 18.5 10ZM19.6 21L13.35 14.75C12.7833 15.1667 12.175 15.4833 11.525 15.7C10.875 15.9 10.2 16 9.5 16C7.68333 16 6.14167 15.375 4.875 14.125C3.625 12.8583 3 11.3167 3 9.5C3 7.68333 3.625 6.15 4.875 4.9C6.14167 3.63333 7.68333 3 9.5 3C9.98333 3 10.4583 3.05833 10.925 3.175C11.3917 3.275 11.8417 3.425 12.275 3.625L11.275 5.375C10.9917 5.24167 10.7 5.15 10.4 5.1C10.1 5.03333 9.8 5 9.5 5C8.25 5 7.18333 5.44167 6.3 6.325C5.43333 7.19167 5 8.25 5 9.5C5 10.75 5.43333 11.8167 6.3 12.7C7.18333 13.5667 8.25 14 9.5 14C10.65 14 11.65 13.625 12.5 12.875C13.35 12.1083 13.8417 11.15 13.975 10H15.975C15.925 10.6 15.8 11.1917 15.6 11.775C15.4 12.3417 15.1167 12.8667 14.75 13.35L21 19.6L19.6 21Z"
                fill="currentColor"
              />
            </svg>
          )}
        </button>
      </div>
      {suggestions && (
        <SuggestionsDropdown
          sections={suggestions}
          onSelect={handleDropdownSelect}
          visible={showDropdown}
          activeIndex={activeIndex}
        />
      )}
    </div>
  );
}
