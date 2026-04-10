import './ComparisonSummary.css';

interface ComparisonSummaryProps {
  text: string;
}

export function ComparisonSummary({text}: ComparisonSummaryProps) {
  if (!text.trim()) return null;

  return (
    <div className="comparison-summary">
      <p className="comparison-summary__text">{text}</p>
    </div>
  );
}
