import {afterEach, describe, expect, it, vi} from 'vitest';
import {cleanup, render, screen} from '@testing-library/react';
import type {Turn} from '@coveo/thermidor';
import {
  makeFollowUpTurn,
  makeResponse,
  makeTurn,
} from '../../../demo-schema-react/src/test/turn-fixtures.js';
import {PromptPage} from './PromptPage.js';

const visit = vi.hoisted(() => ({turns: [] as Turn[]}));

vi.mock('../session/storefront-session.js', () => ({
  useViewSurfaces: () => ({turnsOfVisit: () => visit.turns}),
}));

vi.mock('./AssistantPage.js', () => ({AssistantPage: () => <p>Assistant layout</p>}));

vi.mock('./SearchPage.js', () => ({SearchPage: () => <p>Search layout</p>}));

const searchSurface = {
  surfaceId: 'ui-search',
  rootComponentType: 'CommerceSearch',
  isLoading: false,
};

function renderPage(openingTurnId?: string) {
  render(
    <PromptPage
      prompt="which kayak should I get?"
      visitId={1}
      openingTurnId={openingTurnId}
      conversationVisits={new Set([1])}
      busy={false}
      onSend={() => {}}
      onHome={() => {}}
      onBack={undefined}
      onShowResults={() => {}}
    />
  );
}

describe('PromptPage', () => {
  afterEach(() => {
    cleanup();
    visit.turns = [];
  });

  it('opens the search layout when the answer draws a search surface', () => {
    visit.turns = [makeTurn({id: 't1', response: makeResponse({surfaces: [searchSurface]})})];
    renderPage();

    expect(screen.getByText('Search layout')).toBeTruthy();
  });

  it('keeps the assistant layout for the conversation; a later search opens on its own page', () => {
    visit.turns = [
      makeTurn({id: 't1', response: makeResponse({agent: {messages: [], reasoningSteps: []}})}),
      {
        ...makeFollowUpTurn({id: 't2', text: 'See all kayaks', searchOption: true}),
        response: makeResponse({surfaces: [searchSurface]}),
      },
    ];
    renderPage();

    expect(screen.getByText('Assistant layout')).toBeTruthy();
  });

  it("opens the search layout on a conversation turn's search", () => {
    renderPage('t2');

    expect(screen.getByText('Search layout')).toBeTruthy();
  });

  it('waits for the answer before it picks a layout', () => {
    visit.turns = [makeTurn({id: 't1', status: 'streaming'})];
    renderPage();

    expect(screen.getByText('Working on “which kayak should I get?”…')).toBeTruthy();
  });
});
