import {useMemo} from 'react';
import {marked} from 'marked';
import DOMPurify from 'dompurify';
import {assembleMessages, type AgentMessage} from '../../utils.js';
import styles from './StreamingMessage.module.css';

export interface StreamingMessageProps {
  messages: AgentMessage[];
}

export function StreamingMessage({messages}: StreamingMessageProps) {
  const text = assembleMessages(messages);

  const html = useMemo(() => {
    if (!text) return '';
    try {
      const raw = marked.parse(text, {breaks: true, gfm: true}) as string;
      return DOMPurify.sanitize(raw);
    } catch {
      return DOMPurify.sanitize(text);
    }
  }, [text]);

  if (!text) {
    return null;
  }

  return <div className={styles.messageText} dangerouslySetInnerHTML={{__html: html}} />;
}
