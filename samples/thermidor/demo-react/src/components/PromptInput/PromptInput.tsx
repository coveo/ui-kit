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
  suggestions?: SuggestionSection[];
  onSuggestionSelect?: (item: SuggestionItem, sectionId: string) => void;
}

export function PromptInput({
  onSubmit,
  disabled = false,
  placeholder = 'Ask something...',
  initialValue = '',
  suggestions,
  onSuggestionSelect,
}: PromptInputProps) {
  const [value, setValue] = useState(initialValue);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressNextFocusRef = useRef(false);

  const totalItems = useMemo(
    () => (suggestions ? suggestions.flatMap((s) => s.items) : []),
    [suggestions]
  );

  useEffect(() => {
    setActiveIndex(-1);
  }, [suggestions]);

  const submit = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed && !disabled) {
      onSubmit(trimmed);
      setValue('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [value, disabled, onSubmit]);

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
      onSuggestionSelect?.(item, sectionId);
      setShowDropdown(false);
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
      setActiveIndex((prev) =>
        prev < totalItems.length - 1 ? prev + 1 : prev
      );
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

  function handleInput(e: ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
    const maxHeight = parseInt(getComputedStyle(el).maxHeight, 10);
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
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
          placeholder={placeholder}
          disabled={disabled}
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
          style={{visibility: value ? 'visible' : 'hidden'}}
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
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>
      {suggestions && (
        <SuggestionsDropdown
          sections={suggestions}
          onSelect={(item, sectionId) => {
            onSuggestionSelect?.(item, sectionId);
            setShowDropdown(false);
          }}
          visible={showDropdown}
          activeIndex={activeIndex}
        />
      )}
    </div>
  );
}
