import styles from './SortPlaceholder.module.css';

interface SortPlaceholderProps {
  onToast: () => void;
}

export function SortPlaceholder({onToast}: SortPlaceholderProps) {
  return (
    <div className={styles.container}>
      <label className={styles.label} htmlFor="sort-placeholder-select">
        <strong>Sort by:</strong>
      </label>
      <select
        id="sort-placeholder-select"
        className={styles.select}
        value="relevance"
        onChange={() => {}}
        onClick={onToast}
      >
        <option value="relevance">Relevance</option>
      </select>
    </div>
  );
}
