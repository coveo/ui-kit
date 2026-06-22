import styles from './ArticleCard.module.css';

interface SearchResult {
  uniqueId: string;
  title: string;
  excerpt?: string;
  clickUri: string;
}

interface ArticleCardProps {
  result: SearchResult;
}

export function ArticleCard({result}: ArticleCardProps) {
  return (
    <article className={styles.card} data-id={result.uniqueId}>
      <h3 className={styles.title}>{result.title}</h3>
      {result.excerpt && <p className={styles.excerpt}>{result.excerpt}</p>}
      <a
        className={styles.link}
        href={result.clickUri}
        target="_blank"
        rel="noopener noreferrer"
      >
        {result.clickUri}
      </a>
    </article>
  );
}
