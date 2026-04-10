import {Fragment} from 'react';
import {marked} from 'marked';
import type {Message} from '../types/agent.js';
import {ActivityRenderer} from './ActivityRenderer.js';
import './MessageList.css';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  progressLabel: string | null;
  onActionSelected: (prompt: string) => void;
}

export function MessageList({
  messages,
  isLoading,
  progressLabel,
  onActionSelected,
}: MessageListProps): React.JSX.Element {
  const lastAssistantId =
    [...messages].reverse().find((message) => message.role === 'assistant')
      ?.id ?? null;

  return (
    <section
      className="message-list"
      aria-live="polite"
      aria-label="Conversation messages"
    >
      {messages.length === 0 ? (
        <p className="empty-state">🏄 Start a conversation with Zane 🤙</p>
      ) : null}
      {messages.map((message) => {
        const activities = message.activities ?? [];
        const isActiveAssistantActivity =
          isLoading &&
          message.role === 'assistant' &&
          message.id === lastAssistantId;
        const content =
          message.content || (isActiveAssistantActivity ? '' : '...');

        return (
          <Fragment key={message.id}>
            <article className={`message message-${message.role}`}>
              <p className="message-role">
                {message.role === 'user' ? 'You' : 'Zane (Agent)'}
              </p>
              {message.role === 'user' ? (
                <p className="message-content message-content--plain">
                  {content}
                </p>
              ) : content ? (
                <div
                  className="message-content message-content--markdown"
                  // marked produces sanitized HTML from a trusted agent source
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: marked(content, {async: false}) as string,
                  }}
                />
              ) : null}
              {isActiveAssistantActivity && progressLabel ? (
                <p className="agent-progress__thinking">{progressLabel}</p>
              ) : null}
            </article>
            {activities.map((activity) => (
              <ActivityRenderer
                key={activity.id}
                activity={activity}
                isLoading={isActiveAssistantActivity}
                onActionSelected={onActionSelected}
              />
            ))}
          </Fragment>
        );
      })}
    </section>
  );
}
