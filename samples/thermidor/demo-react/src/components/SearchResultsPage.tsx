import {FormEvent, useRef} from 'react';
import type {RoutedInterface} from '@coveo/thermidor';

interface SearchResultsPageProps {
  onSubmit: (prompt: string) => void;
  isStreaming: boolean;
  routedInterface: RoutedInterface;
  error: string | null;
}

export function SearchResultsPage({
  onSubmit,
  isStreaming,
  routedInterface,
  error,
}: SearchResultsPageProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const value = inputRef.current?.value.trim();
    if (value) {
      onSubmit(value);
      inputRef.current!.value = '';
    }
  };

  return (
    <section>
      <h1>Search Results</h1>
      {error && (
        <p role="alert" style={{color: 'var(--color-error)'}}>
          {error}
        </p>
      )}
      <p>Use case: {routedInterface.useCase}</p>
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          disabled={isStreaming}
          aria-label="Prompt"
        />
        <button type="submit" disabled={isStreaming}>
          Submit
        </button>
      </form>
    </section>
  );
}
