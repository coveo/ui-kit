import styles from './UserPromptBubble.module.css';

interface UserPromptBubbleProps {
  prompt: string;
}

const CONTEXT_PATTERN = /\s*\[ADDITIONAL CONTEXT:\s*(.+?)\]$/;

function parsePrompt(prompt: string): {text: string; products: string[]} {
  const match = prompt.match(CONTEXT_PATTERN);
  if (!match) {
    return {text: prompt, products: []};
  }
  const text = prompt.slice(0, match.index ?? prompt.length).trim();
  const products = match[1]
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);
  return {text, products};
}

export function UserPromptBubble({prompt}: UserPromptBubbleProps) {
  const {text, products} = parsePrompt(prompt);

  return (
    <div className={styles.bubble}>
      {text && <p className={styles.promptText}>{text}</p>}
      {products.length > 0 && (
        <>
          <hr className={styles.separator} />
          <div className={styles.contextSection}>
            <strong className={styles.contextLabel}>Products:</strong>
            <ul className={styles.productList}>
              {products.map((name, i) => (
                <li key={i} className={styles.productItem}>
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
