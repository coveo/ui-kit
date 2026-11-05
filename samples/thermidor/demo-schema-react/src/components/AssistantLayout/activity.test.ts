import {describe, expect, it} from 'vitest';
import type {ToolCallStep} from '@coveo/thermidor';
import {activityOf, describeToolCall} from './activity.js';

function toolCall(
  id: string,
  name: string,
  args: Record<string, unknown> = {},
  status: ToolCallStep['status'] = 'completed'
): ToolCallStep {
  return {type: 'tool-call', id, name, args: JSON.stringify(args), status} as ToolCallStep;
}

describe('describeToolCall', () => {
  it('names the tool, with the words it searched for', () => {
    expect(
      describeToolCall(toolCall('1', 'coveo_commerce_search', {query: 'kayak'}, 'calling'))
    ).toBe('coveo_commerce_search “kayak”');
    expect(describeToolCall(toolCall('2', 'store_render_plan'))).toBe('store_render_plan');
  });

  it('hides routing and memory bookkeeping', () => {
    expect(describeToolCall(toolCall('1', 'route_bundle'))).toBeUndefined();
    expect(describeToolCall(toolCall('2', 'store_reference_context'))).toBeUndefined();
  });
});

describe('activityOf', () => {
  const steps = [
    toolCall('s1', 'coveo_commerce_search', {query: 'kayak'}),
    toolCall('r1', 'route_bundle'),
    toolCall('s2', 'discover_price_range', {query: 'kayak'}),
    toolCall('s3', 'store_render_plan', {}, 'calling'),
  ];

  it('places an added message after the step the agent had reached when it took it', () => {
    const entries = activityOf(
      steps,
      [
        {id: 'a1', text: 'under $1000', status: 'applied'},
        {id: 'a2', text: 'with a dry bag', status: 'waiting'},
      ],
      new Map([['a1', 1]])
    );

    expect(entries.map((entry) => entry.text)).toEqual([
      'coveo_commerce_search “kayak”',
      'under $1000',
      'discover_price_range “kayak”',
      'store_render_plan',
      'with a dry bag',
    ]);
    expect(entries.at(-2)).toMatchObject({kind: 'step', done: false});
  });

  it('puts a message taken before any step first', () => {
    const entries = activityOf(
      steps,
      [{id: 'a1', text: 'for two', status: 'applied'}],
      new Map([['a1', 0]])
    );

    expect(entries[0]).toMatchObject({kind: 'added', text: 'for two'});
  });
});
