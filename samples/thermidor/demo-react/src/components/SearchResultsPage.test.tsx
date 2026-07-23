import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import {SearchResultsPage} from './SearchResultsPage.js';

describe('SearchResultsPage suggestions integration', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    isStreaming: false,
    routedInterface: {useCase: 'search'} as any,
  };

  function renderPage(overrides = {}) {
    const props = {...defaultProps, onSubmit: vi.fn(), ...overrides};
    const result = render(<SearchResultsPage {...props} />);
    return {...result, props};
  }

  it('PromptInput receives suggestions prop with 3 sections', () => {
    renderPage();

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.focus(textarea);

    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeDefined();

    expect(screen.getByText('Search refinements')).toBeDefined();
    expect(screen.getByText('Search')).toBeDefined();
    expect(screen.getByText('Conversational')).toBeDefined();
  });

  it('selecting a search item triggers submit', () => {
    const {props} = renderPage();

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.focus(textarea);

    fireEvent.mouseDown(screen.getByText('Surfboards'));

    expect(props.onSubmit).toHaveBeenCalledWith('Surfboards');
  });

  it('selecting a conversational item triggers submit', () => {
    const {props} = renderPage();

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.focus(textarea);

    fireEvent.mouseDown(screen.getByText('Build a beginner surfing kit'));

    expect(props.onSubmit).toHaveBeenCalledWith('Build a beginner surfing kit');
  });

  it('selecting a refinement item shows toast notification', () => {
    renderPage();

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.focus(textarea);

    fireEvent.mouseDown(screen.getByText('Show boards under $400'));

    expect(screen.getByRole('status')).toBeDefined();
    expect(screen.getByText('Not supported yet')).toBeDefined();
  });
});
