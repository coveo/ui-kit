import {render} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import type {ReasoningStep} from '@coveo/thermidor';
import {ThinkingBlock} from './ThinkingBlock.js';

function renderThinkingBlock(reasoningSteps: ReasoningStep[] = [], isStreaming = true) {
  return render(<ThinkingBlock reasoningSteps={reasoningSteps} isStreaming={isStreaming} />);
}

describe('ThinkingBlock', () => {
  describe('collapsed by default', () => {
    it('renders a details element without the open attribute', () => {
      const {container} = renderThinkingBlock();
      const details = container.querySelector('details');
      expect(details).not.toBeNull();
      expect(details!.hasAttribute('open')).toBe(false);
    });
  });

  describe('shows "Working..." when no reasoning steps received', () => {
    it('shows "Working" with animated dots when streaming with no steps', () => {
      const {container} = renderThinkingBlock([], true);
      const summary = container.querySelector('summary');
      expect(summary!.textContent).toContain('Working');
    });

    it('does not show "Reasoning" text when no steps received', () => {
      const {container} = renderThinkingBlock([], true);
      const summary = container.querySelector('summary');
      expect(summary!.textContent).not.toContain('Reasoning');
    });
  });

  describe('"Reasoning..." when reasoning messages are streaming', () => {
    it('shows "Reasoning" with animated dots while reasoning streams', () => {
      const steps: ReasoningStep[] = [{type: 'reasoning', content: 'Analyzing the query...'}];
      const {container} = renderThinkingBlock(steps, true);
      const summary = container.querySelector('summary');
      expect(summary!.textContent).toContain('Reasoning');
    });
  });

  describe('shows tool call count when streaming is complete', () => {
    it('shows "2 tool calls" when there are multiple tool calls', () => {
      const steps: ReasoningStep[] = [
        {type: 'reasoning', content: 'Analyzing...'},
        {
          type: 'tool-call',
          id: 'tc-1',
          name: 'search_products',
          args: '{}',
          result: 'found',
          status: 'completed',
        },
        {
          type: 'tool-call',
          id: 'tc-2',
          name: 'get_details',
          args: '{}',
          result: 'details',
          status: 'completed',
        },
      ];
      const {container} = renderThinkingBlock(steps, false);
      const summary = container.querySelector('summary');
      expect(summary!.textContent).toContain('2 tool calls');
    });

    it('shows "1 tool call" when there is exactly one tool call', () => {
      const steps: ReasoningStep[] = [
        {
          type: 'tool-call',
          id: 'tc-1',
          name: 'search_products',
          args: '{}',
          result: 'found',
          status: 'completed',
        },
      ];
      const {container} = renderThinkingBlock(steps, false);
      const summary = container.querySelector('summary');
      expect(summary!.textContent).toContain('1 tool call');
      expect(summary!.textContent).not.toContain('1 tool calls');
    });

    it('shows "Done." when there are no tool calls', () => {
      const steps: ReasoningStep[] = [{type: 'reasoning', content: 'Done analyzing.'}];
      const {container} = renderThinkingBlock(steps, false);
      const summary = container.querySelector('summary');
      expect(summary!.textContent).toContain('Done.');
    });

    it('does not show animated dots when complete', () => {
      const steps: ReasoningStep[] = [{type: 'reasoning', content: 'Done analyzing.'}];
      const {container} = renderThinkingBlock(steps, false);
      const dots = container.querySelector('[aria-hidden="true"][class*="animatedDots"]');
      expect(dots).toBeNull();
    });

    it('does not show any checkmark', () => {
      const steps: ReasoningStep[] = [{type: 'reasoning', content: 'Done analyzing.'}];
      const {container} = renderThinkingBlock(steps, false);
      const summary = container.querySelector('summary');
      expect(summary!.textContent).not.toContain('✓');
    });
  });

  describe('"Calling tool: <name>..." for active tool call', () => {
    it('shows "Calling tool:" with tool name and animated dots', () => {
      const steps: ReasoningStep[] = [
        {
          type: 'tool-call',
          id: 'tc-1',
          name: 'search_products',
          args: '{"query":"shoes"}',
          status: 'calling',
        },
      ];
      const {container} = renderThinkingBlock(steps, true);
      const summary = container.querySelector('summary');
      expect(summary!.textContent).toContain('Calling tool:');
      expect(summary!.textContent).toContain('search_products');
    });
  });

  describe('completed tool call shows "Reasoning..." (falls through)', () => {
    it('shows "Reasoning..." when last tool call is completed but still streaming', () => {
      const steps: ReasoningStep[] = [
        {
          type: 'tool-call',
          id: 'tc-1',
          name: 'search_products',
          args: '{"query":"shoes"}',
          result: '5 results found',
          status: 'completed',
        },
      ];
      const {container} = renderThinkingBlock(steps, true);
      const summary = container.querySelector('summary');
      expect(summary!.textContent).toContain('Reasoning');
    });
  });

  describe('expand/collapse icon', () => {
    it('renders a chevron icon in the summary', () => {
      const {container} = renderThinkingBlock();
      const chevron = container.querySelector('[class*="chevron"]');
      expect(chevron).not.toBeNull();
      expect(chevron!.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('expanded state renders reasoning as markdown', () => {
    it('renders reasoning content as HTML via marked when details is open', () => {
      const steps: ReasoningStep[] = [{type: 'reasoning', content: '**bold reasoning**'}];
      const {container} = renderThinkingBlock(steps, false);

      const details = container.querySelector('details')!;
      details.setAttribute('open', '');

      const boldEl = container.querySelector('strong');
      expect(boldEl).not.toBeNull();
      expect(boldEl!.textContent).toBe('bold reasoning');
    });
  });

  describe('nested tool calls are collapsed by default', () => {
    it('renders tool calls as nested details elements without the open attribute', () => {
      const steps: ReasoningStep[] = [
        {type: 'reasoning', content: 'Let me search for that.'},
        {
          type: 'tool-call',
          id: 'tc-1',
          name: 'search_products',
          args: '{"query":"shoes"}',
          result: '5 results found',
          status: 'completed',
        },
      ];
      const {container} = renderThinkingBlock(steps, false);

      const allDetails = container.querySelectorAll('details');
      expect(allDetails.length).toBeGreaterThanOrEqual(2);

      const nestedDetails = allDetails[1];
      expect(nestedDetails.hasAttribute('open')).toBe(false);
    });

    it('shows "Tool call: <name>" in nested summary', () => {
      const steps: ReasoningStep[] = [
        {
          type: 'tool-call',
          id: 'tc-1',
          name: 'search_products',
          args: '{"query":"shoes"}',
          result: '5 results found',
          status: 'completed',
        },
      ];
      const {container} = renderThinkingBlock(steps, false);

      const allDetails = container.querySelectorAll('details');
      const nestedSummary = allDetails[1].querySelector('summary');
      expect(nestedSummary!.textContent).toContain('Tool call:');
      expect(nestedSummary!.textContent).toContain('search_products');
    });

    it('renders a chevron icon in nested tool call summary', () => {
      const steps: ReasoningStep[] = [
        {
          type: 'tool-call',
          id: 'tc-1',
          name: 'search_products',
          args: '{"query":"shoes"}',
          result: '5 results found',
          status: 'completed',
        },
      ];
      const {container} = renderThinkingBlock(steps, false);

      const allDetails = container.querySelectorAll('details');
      const nestedChevron = allDetails[1].querySelector('[class*="chevron"]');
      expect(nestedChevron).not.toBeNull();
    });
  });
});
