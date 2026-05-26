import {type FormEventHandler, useRef, useState} from 'react';
import type {
  ConversationControllerSubmitTurnOptions,
  ConversationController,
} from '@coveo/headless-future';

interface UseConversationComposerProps {
  controller: Pick<ConversationController, 'submitTurn'>;
  turnCount: number;
}

export function useConversationComposer({
  controller,
  turnCount,
}: UseConversationComposerProps) {
  const [input, setInput] = useState('');
  const initialContinuationRef =
    useRef<ConversationControllerSubmitTurnOptions | null>(
      getInitialContinuationFromUrl() ?? null
    );

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }

    const initialContinuation = initialContinuationRef.current;

    if (turnCount === 0 && initialContinuation) {
      void controller.submitTurn(trimmed, initialContinuation);
      initialContinuationRef.current = null;
    } else {
      void controller.submitTurn(trimmed);
    }

    setInput('');
  };

  return {
    input,
    setInput,
    handleSubmit,
  };
}

function getInitialContinuationFromUrl():
  | ConversationControllerSubmitTurnOptions
  | undefined {
  const searchParams = new URLSearchParams(window.location.search);
  const sessionFromUrl =
    searchParams.get('conversationSessionId') ??
    searchParams.get('sessionId') ??
    searchParams.get('conversationId');
  const tokenFromUrl = searchParams.get('conversationToken');

  if (sessionFromUrl === null && tokenFromUrl === null) {
    return undefined;
  }

  return {
    conversationSessionId: sessionFromUrl,
    conversationToken: tokenFromUrl,
  };
}
