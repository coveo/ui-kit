import {useEffect, useRef} from 'react';

interface ComparisonSummaryElement extends HTMLElement {
  text: string;
}

interface ComparisonSummaryProps {
  text: string;
}

export function ComparisonSummary({text}: ComparisonSummaryProps) {
  const elementRef = useRef<ComparisonSummaryElement | null>(null);

  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.text = text;
    }
  }, [text]);

  return <cac-comparison-summary ref={elementRef} />;
}
