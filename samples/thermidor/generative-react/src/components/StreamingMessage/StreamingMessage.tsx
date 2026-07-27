import {useMemo} from 'react';
import {marked} from 'marked';
import {assembleMessages, type AgentMessage} from '../../utils.js';
import styles from './StreamingMessage.module.css';

marked.setOptions({
  breaks: true,
  gfm: true,
});

export interface StreamingMessageProps {
  messages: AgentMessage[];
}

export function StreamingMessage({messages}: StreamingMessageProps) {
  const text = assembleMessages(messages);

  const html = useMemo(() => {
    if (!text) return '';
    return marked.parse(text) as string;
  }, [text]);

  if (!text) {
    return null;
  }

  return <div className={styles.messageText} dangerouslySetInnerHTML={{__html: html}} />;
}
