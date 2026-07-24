import styles from './StarRating.module.css';

interface StarRatingProps {
  rating: number | null | undefined;
  maxValue?: number;
}

export function StarRating({rating, maxValue = 5}: StarRatingProps) {
  const noRating = rating == null;
  const filled = noRating ? 0 : Math.round(rating);

  return (
    <span
      className={styles.rating}
      aria-label={noRating ? 'No rating' : `${rating} out of ${maxValue} stars`}
    >
      {Array.from({length: maxValue}, (_, i) => (
        <span
          key={i}
          className={noRating ? styles.outline : i < filled ? styles.filled : styles.empty}
        >
          {noRating ? '☆' : '★'}
        </span>
      ))}
    </span>
  );
}
