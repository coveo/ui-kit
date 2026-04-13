import {marked} from 'marked';

export function renderMarkdown(content: string): string {
  // The source is trusted agent output in this sample app.
  return marked(content, {async: false}) as string;
}
