import {useId} from 'react';
import styles from './StarRating.module.css';

interface StarRatingProps {
  rating: number | null | undefined;
  maxValue?: number;
}

const STAR_PATH =
  'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z';
const STAR_SIZE = 16;
const GAP = 2;
const FILLED_COLOR = '#f59e0b';
const EMPTY_COLOR = '#e2e8f0';

function getStarFill(
  index: number,
  whole: number,
  fraction: number,
  gradientId: string
): string {
  if (index < whole) return FILLED_COLOR;
  if (index === whole && fraction > 0) return `url(#${gradientId})`;
  return EMPTY_COLOR;
}

export function StarRating({rating, maxValue = 5}: StarRatingProps) {
  const id = useId();
  const noRating = rating == null;
  const value = rating ?? 0;
  const whole = Math.floor(value);
  const fraction = value - whole;
  const partialId = `${id}-partial`;
  const symbolId = `${id}-star`;

  return (
    <svg
      className={styles.rating}
      width={maxValue * STAR_SIZE + (maxValue - 1) * GAP}
      height={STAR_SIZE}
      role="img"
      aria-label={noRating ? 'No rating' : `${value} out of ${maxValue} stars`}
    >
      <defs>
        <symbol id={symbolId} viewBox="0 0 24 24">
          <path d={STAR_PATH} />
        </symbol>
        {!noRating && fraction > 0 && (
          <linearGradient id={partialId} x1="0" x2="1" y1="0" y2="0">
            <stop offset={`${fraction * 100}%`} stopColor={FILLED_COLOR} />
            <stop offset={`${fraction * 100}%`} stopColor={EMPTY_COLOR} />
          </linearGradient>
        )}
      </defs>
      {Array.from({length: maxValue}, (_, i) => {
        const color = noRating
          ? EMPTY_COLOR
          : getStarFill(i, whole, fraction, partialId);

        return (
          <use
            key={i}
            href={`#${symbolId}`}
            x={i * (STAR_SIZE + GAP)}
            y={0}
            width={STAR_SIZE}
            height={STAR_SIZE}
            fill={noRating ? 'none' : color}
            stroke={color}
            strokeWidth="3"
            strokeLinejoin="round"
            paintOrder="stroke fill"
          />
        );
      })}
    </svg>
  );
}
