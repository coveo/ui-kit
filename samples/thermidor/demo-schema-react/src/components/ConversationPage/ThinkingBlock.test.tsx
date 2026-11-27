import {render} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import type {ToolCall} from '@coveo/converse';
import {ThinkingBlock} from './ThinkingBlock.js';

function toolCall(overrides: Partial<ToolCall> = {}): ToolCall {
  return {
    id: 'tc-1',
    name: 'search_products',
    args: '{"query":"shoes"}',
    result: '5 results found',
    status: 'completed',
    ...overrides,
  };
}

function renderThinkingBlock(toolCalls: ToolCall[] = [], isStreaming = true) {
  return render(<ThinkingBlock toolCalls={toolCalls} isStreaming={isStreaming} />);
}

function summaryText(container: HTMLElement) {
  return container.querySelector('summary')!.textContent;
}

describe('ThinkingBlock', () => {
  it('renders a collapsed details element with a chevron', () => {
    const {container} = renderThinkingBlock();
    const details = container.querySelector('details')!;
    const chevron = details.querySelector('[class*="chevron"]');

    expect(details.hasAttribute('open')).toBe(false);
    expect(chevron!.getAttribute('aria-hidden')).toBe('true');
  });

  describe('while streaming', () => {
    it('shows "Thinking" before any tool call', () => {
      const {container} = renderThinkingBlock([], true);

      expect(summaryText(container)).toContain('Thinking');
    });

    it('shows "Thinking" once the last tool call completes', () => {
      const {container} = renderThinkingBlock([toolCall()], true);

      expect(summaryText(container)).toContain('Thinking');
    });

    it('shows "Calling tool: <name>" while a tool call is active', () => {
      const {container} = renderThinkingBlock(
        [toolCall({result: undefined, status: 'calling'})],
        true
      );

      expect(summaryText(container)).toContain('Calling tool: search_products');
    });
  });

  describe('once streaming completes', () => {
    it('shows "2 tool calls" when there are multiple tool calls', () => {
      const {container} = renderThinkingBlock(
        [toolCall(), toolCall({id: 'tc-2', name: 'get_details'})],
        false
      );

      expect(summaryText(container)).toContain('2 tool calls');
    });

    it('shows "1 tool call" when there is exactly one tool call', () => {
      const {container} = renderThinkingBlock([toolCall()], false);

      expect(summaryText(container)).toContain('1 tool call');
      expect(summaryText(container)).not.toContain('1 tool calls');
    });

    it('shows "Done." without animated dots when there are no tool calls', () => {
      const {container} = renderThinkingBlock([], false);
      const dots = container.querySelector('[aria-hidden="true"][class*="animatedDots"]');

      expect(summaryText(container)).toContain('Done.');
      expect(dots).toBeNull();
    });
  });

  it('renders each tool call as a collapsed nested details labelled with its name', () => {
    const {container} = renderThinkingBlock([toolCall()], false);
    const nested = container.querySelectorAll('details')[1];

    expect(nested.hasAttribute('open')).toBe(false);
    expect(nested.querySelector('summary')!.textContent).toContain('Tool call: search_products');
    expect(nested.querySelector('[class*="chevron"]')).not.toBeNull();
  });
});
