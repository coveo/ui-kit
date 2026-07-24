import {FormEvent, useRef} from 'react';
import type {Turn} from '@coveo/thermidor';

interface ConversationPageProps {
  onSubmit: (prompt: string) => void;
  isStreaming: boolean;
  turns: Turn[];
  onBackToSearch: () => void;
  canGoBackToSearch: boolean;
  onResetToLanding: () => void;
}

export function ConversationPage({
  onSubmit,
  isStreaming,
  turns,
  onBackToSearch,
  canGoBackToSearch,
  onResetToLanding,
}: ConversationPageProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const value = inputRef.current?.value.trim();
    if (value) {
      onSubmit(value);
      inputRef.current!.value = '';
    }
  };

  const latestPrompt = turns.length > 0 ? turns[turns.length - 1].prompt : '';

  return (
    <section>
      <h1>Conversation</h1>
      {latestPrompt && <p>Latest prompt: {latestPrompt}</p>}
      <nav>
        {canGoBackToSearch && (
          <button type="button" onClick={onBackToSearch}>
            Back to search results
          </button>
        )}
        <button type="button" onClick={onResetToLanding}>
          Reset
        </button>
      </nav>
      <form onSubmit={handleSubmit}>
        <input ref={inputRef} type="text" disabled={isStreaming} aria-label="Prompt" />
        <button type="submit" disabled={isStreaming}>
          Submit
        </button>
      </form>
    </section>
  );
}
