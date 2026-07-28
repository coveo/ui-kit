import styles from './SuggestionPills.module.css';

export const PROMPT_SUGGESTIONS = [
  'build a beginner surfing kit with budget, mid-range, and premium options',
  'what should i pack for a snorkeling trip?',
  'kayaks',
  'wetsuits',
  'surfboard care',
  'boating safety',
  'I like cold-water surfing. Compare wetsuits for it',
];

interface SuggestionPillsProps {
  onSelect: (suggestion: string) => void;
  disabled?: boolean;
  suggestions?: string[];
}

export function SuggestionPills({
  onSelect,
  disabled = false,
  suggestions = PROMPT_SUGGESTIONS,
}: SuggestionPillsProps) {
  return (
    <div className={styles.container} role="group" aria-label="Suggestions">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          className={styles.pill}
          onClick={() => onSelect(suggestion)}
          disabled={disabled}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
