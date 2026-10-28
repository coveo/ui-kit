import {afterEach, describe, expect, it, vi} from 'vitest';
import {cleanup, fireEvent, render, screen, within} from '@testing-library/react';
import type {DiscoveredSurface, Turn} from '@coveo/thermidor';
import {
  makeFollowUpTurn,
  makeSurfaces,
  makeTurn,
} from '../../../demo-schema-react/src/test/turn-fixtures.js';
import {AssistantPage} from './AssistantPage.js';

const pageView = vi.hoisted(() => ({turns: [] as Turn[]}));

vi.mock('./use-page-view.js', () => ({
  usePageView: () => ({
    turns: pageView.turns,
    turn: pageView.turns.at(-1),
    surfaces: pageView.turns.flatMap((turn) => turn.response.surfaces),
  }),
}));

vi.mock('../views/ViewSurfaces.js', () => ({
  ViewSurfaces: ({
    surfaces,
    interactive = true,
  }: {
    surfaces: readonly DiscoveredSurface[];
    interactive?: boolean;
  }) => (
    <ul aria-label={interactive ? 'Surfaces' : 'Read-only surfaces'}>
      {surfaces.map(({surfaceId}) => (
        <li key={surfaceId}>{surfaceId}</li>
      ))}
    </ul>
  ),
}));

function renderPage(overrides: Partial<Parameters<typeof AssistantPage>[0]> = {}) {
  const onSend = vi.fn();
  render(
    <AssistantPage
      prompt="first question"
      visitId={1}
      busy={false}
      onSend={onSend}
      onBack={() => {}}
      {...overrides}
    />
  );
  return {onSend};
}

describe('AssistantPage', () => {
  afterEach(() => {
    cleanup();
    pageView.turns = [];
  });

  it('draws every turn of the visit in order, each with its prompt and its own surfaces', () => {
    pageView.turns = [
      makeTurn({id: 't1', prompt: 'first question', response: {surfaces: makeSurfaces('ui-a')}}),
      makeTurn({id: 't2', prompt: 'second question', response: {surfaces: makeSurfaces('ui-b')}}),
    ];
    renderPage();

    const turns = within(screen.getByRole('log', {name: 'Conversation'})).getAllByRole('article');
    expect(turns.map((turn) => turn.getAttribute('aria-label'))).toEqual(['Turn 1', 'Turn 2']);
    expect(turns[0].textContent).toContain('first question');
    expect(within(turns[0]).getByRole('list', {name: 'Read-only surfaces'}).textContent).toBe(
      'ui-a'
    );
    expect(turns[1].textContent).toContain('second question');
    expect(within(turns[1]).getByRole('list', {name: 'Surfaces'}).textContent).toBe('ui-b');
  });

  it("shows the visit's prompt before the session opens its turn", () => {
    renderPage();

    expect(screen.getByRole('log', {name: 'Conversation'}).textContent).toContain('first question');
  });

  it('shows the text of the chip that opened a turn as its prompt', () => {
    pageView.turns = [
      makeTurn({id: 't1', prompt: 'which kayak should I get?'}),
      makeFollowUpTurn({id: 't2', text: 'See all kayaks', searchOption: true}),
    ];
    renderPage();

    const turns = screen.getAllByRole('article');
    expect(turns[1].textContent).toContain('See all kayaks');
    expect(turns[1].textContent).not.toContain('which kayak should I get?');
  });

  it("shows a turn's error in its place in the thread", () => {
    pageView.turns = [makeTurn({id: 't1', status: 'error', error: 'Server unavailable'})];
    renderPage();

    expect(screen.getByRole('alert').textContent).toBe('Server unavailable');
  });

  it('sends the next prompt from the input at the bottom', () => {
    pageView.turns = [makeTurn({id: 't1'})];
    const {onSend} = renderPage();

    fireEvent.change(screen.getByRole('combobox', {name: 'Prompt'}), {
      target: {value: 'and in blue?'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Submit'}));

    expect(onSend).toHaveBeenCalledWith('and in blue?');
  });

  it('holds the next prompt while a request is in flight', () => {
    pageView.turns = [makeTurn({id: 't1', status: 'streaming'})];
    const {onSend} = renderPage({busy: true});

    fireEvent.change(screen.getByRole('combobox', {name: 'Prompt'}), {
      target: {value: 'and in blue?'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Submit'}));

    expect(onSend).not.toHaveBeenCalled();
  });
});
