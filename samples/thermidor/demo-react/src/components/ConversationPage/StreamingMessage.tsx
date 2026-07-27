import {useMemo} from 'react';
import {assembleMessages, renderMarkdown, type AgentMessage} from '../../utils.js';
import styles from './StreamingMessage.module.css';

export interface StreamingMessageProps {
  messages: AgentMessage[];
}

export function StreamingMessage({messages}: StreamingMessageProps) {
  const text = assembleMessages(messages);

  const html = useMemo(() => {
    if (!text) return '';
    return renderMarkdown(text);
  }, [text]);

  if (!text) {
    return null;
  }

  return <div className={styles.messageText} dangerouslySetInnerHTML={{__html: html}} />;
}
