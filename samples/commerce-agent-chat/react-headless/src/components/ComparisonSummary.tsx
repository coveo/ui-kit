import './ComparisonSummary.css';

interface ComparisonSummaryProps {
  text: string;
}

export function ComparisonSummary({
  text,
}: ComparisonSummaryProps): React.JSX.Element | null {
  if (!text.trim()) {
    return null;
  }

  return (
    <div className="rh-comparison-summary">
      <p className="rh-comparison-summary__text">{text}</p>
    </div>
  );
}
