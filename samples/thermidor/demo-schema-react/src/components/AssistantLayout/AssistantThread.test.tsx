import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import type {Turn} from '@coveo/thermidor';
import {A2UIProvider} from '@copilotkit/a2ui-renderer';
import {createThermidorCatalog} from '../../a2ui/components.js';
import {ThermidorA2UIStream} from '../../a2ui/surfaces.js';
import {makeSurfaces, makeTurn} from '../../test/turn-fixtures.js';
import {AssistantThread} from './AssistantThread.js';
import {latestSearch} from './turns.js';

function searchTurn(id: string, prompt: string): Turn {
  return makeTurn({id, prompt, response: {surfaces: makeSurfaces(`results-${id}`)}});
}

function answerTurn(id: string, prompt: string, overrides: Partial<Turn> = {}): Turn {
  return {
    ...makeTurn({
      id,
      prompt,
      response: {
        agent: {
          messages: [{role: 'assistant', content: 'Here is a beginner kayak bundle.'}],
          reasoningSteps: [
            {
              type: 'tool-call',
              id: `${id}-search`,
              name: 'coveo_commerce_search',
              args: '{"query":"kayak"}',
              status: 'completed',
            },
            {
              type: 'tool-call',
              id: `${id}-route`,
              name: 'route_bundle',
              args: '{}',
              status: 'completed',
            },
          ],
        },
      },
    }),
    ...overrides,
  } as Turn;
}

function renderThread(turns: Turn[], panelSearches: string[] = [], onAsk = vi.fn()) {
  render(
    <A2UIProvider catalog={createThermidorCatalog()} onAction={() => {}}>
      <ThermidorA2UIStream messages={[]}>
        <AssistantThread turns={turns} panelSearches={new Set(panelSearches)} onAsk={onAsk} />
      </ThermidorA2UIStream>
    </A2UIProvider>
  );
  return onAsk;
}

describe('AssistantThread', () => {
  it('keeps a search typed in the results panel out of the chat', () => {
    renderThread([searchTurn('t1', 'wetsuit')], ['wetsuit']);

    expect(screen.queryByText('wetsuit')).toBeNull();
    expect(screen.queryByText(/Showing “wetsuit”/)).toBeNull();
    expect(screen.getByText(/I can compare products/)).toBeTruthy();
  });

  it('leaves a one-line trace for a question the gateway answered with a search', () => {
    renderThread([searchTurn('t1', 'kayaks')]);

    expect(screen.getByText('Showing “kayaks” in the results')).toBeTruthy();
  });

  it('shows an answer with its activity in the shopper’s words, not tool names', () => {
    renderThread([answerTurn('t1', 'build me a kayak bundle')]);

    expect(screen.getByText('build me a kayak bundle')).toBeTruthy();
    expect(screen.getByText('Done in 1 step')).toBeTruthy();
    expect(screen.getByText('Searched “kayak”')).toBeTruthy();
    expect(screen.queryByText(/route_bundle|coveo_commerce_search/)).toBeNull();
  });

  it('still confirms what a finished answer took from the shopper', () => {
    renderThread([
      answerTurn('t1', 'build me a kayak bundle', {
        addedMessages: [{id: 'a1', text: 'under $1000', status: 'applied'}],
      }),
    ]);

    expect(screen.getByText('Done in 1 step · took “under $1000”')).toBeTruthy();
  });

  it('offers to continue a stopped answer from where it stopped', () => {
    const onAsk = renderThread([
      answerTurn('t1', 'build me a kayak bundle', {
        stopped: true,
        addedMessages: [{id: 'a1', text: 'under $1000', status: 'applied'}],
      }),
    ]);

    expect(screen.getByText('Stopped after 1 step')).toBeTruthy();
    screen.getByRole('button', {name: 'Continue'}).click();
    expect(onAsk).toHaveBeenCalledWith('Continue: build me a kayak bundle (under $1000)');
  });
});

describe('latestSearch', () => {
  it('finds the newest search results, past later answers', () => {
    const turns = [
      searchTurn('t1', 'wetsuit'),
      searchTurn('t2', 'kayaks'),
      answerTurn('t3', 'which is best?'),
    ];

    expect(latestSearch(turns)?.surface.surfaceId).toBe('results-t2');
  });
});
