import {FormEvent, useRef} from 'react';

interface LandingPageProps {
  onSubmit: (prompt: string) => void;
  isStreaming: boolean;
  error: string | null;
}

export function LandingPage({onSubmit, isStreaming, error}: LandingPageProps) {
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
      <h1>Landing</h1>
      {error && (
        <p role="alert" style={{color: 'var(--color-error)'}}>
          {error}
        </p>
      )}
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
