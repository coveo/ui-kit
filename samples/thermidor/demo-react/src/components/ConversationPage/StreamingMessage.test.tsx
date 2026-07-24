import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import {StreamingMessage} from './StreamingMessage.js';

describe('StreamingMessage', () => {
  it('renders markdown content from messages', () => {
    const messages = [
      {content: '**bold text**', role: 'assistant'},
      {content: 'plain text', role: 'assistant'},
    ];

    const {container} = render(<StreamingMessage messages={messages} />);

    expect(container.querySelector('strong')?.textContent).toBe('bold text');
    expect(container.textContent).toContain('plain text');
  });

  it('returns null when messages array is empty', () => {
    const {container} = render(<StreamingMessage messages={[]} />);

    expect(container.innerHTML).toBe('');
  });

  it('returns null when there is a single message with empty content', () => {
    const messages = [{content: '', role: 'assistant'}];

    const {container} = render(<StreamingMessage messages={messages} />);

    expect(container.innerHTML).toBe('');
  });

  it('renders headings from markdown', () => {
    const messages = [{content: '## Section Title', role: 'assistant'}];

    const {container} = render(<StreamingMessage messages={messages} />);

    const heading = container.querySelector('h2');
    expect(heading?.textContent).toBe('Section Title');
  });

  it('renders links from markdown', () => {
    const messages = [{content: '[click here](https://example.com)', role: 'assistant'}];

    const {container} = render(<StreamingMessage messages={messages} />);

    const link = container.querySelector('a');
    expect(link?.getAttribute('href')).toBe('https://example.com');
    expect(link?.textContent).toBe('click here');
  });
});
