import {useState} from 'react';
import styles from './PromptInput.module.css';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  disabled: boolean;
  suggestions?: string[];
}

export function PromptInput({
  onSubmit,
  disabled,
  suggestions = [],
}: PromptInputProps) {
  const [value, setValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !disabled) {
      e.preventDefault();
      submit(value);
    }
  }

  function submit(text: string) {
    const trimmed = text.trim();
    if (trimmed) {
      onSubmit(trimmed);
      setValue('');
      setShowSuggestions(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <input
        type="text"
        className={styles.input}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        placeholder="Ask something..."
        disabled={disabled}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className={styles.dropdown}>
          {suggestions.map((s) => (
            <li
              key={s}
              className={styles.suggestion}
              onMouseDown={() => submit(s)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
