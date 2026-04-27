import {
  buildInteractiveGeneratedAnswerInlineLink,
  type InteractiveGeneratedAnswerInlineLink,
} from '@coveo/headless';
import {html} from 'lit';
import {describe, expect, it, vi, beforeEach} from 'vitest';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import type {AtomicGeneratedAnswerInlineLink} from './atomic-generated-answer-inline-link';
import './atomic-generated-answer-inline-link';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-generated-answer-inline-link', () => {
  let mockedInteractiveLink: InteractiveGeneratedAnswerInlineLink;

  beforeEach(() => {
    mockedInteractiveLink = {
      select: vi.fn(),
      beginDelayedSelect: vi.fn(),
      cancelPendingSelect: vi.fn(),
    };

    vi.mocked(buildInteractiveGeneratedAnswerInlineLink).mockReturnValue(
      mockedInteractiveLink
    );
  });

  const setupElement = async (
    props?: Partial<{
      href: string;
      answerId: string;
      text: string;
      title: string;
    }>
  ) => {
    const {element} =
      await renderInAtomicSearchInterface<AtomicGeneratedAnswerInlineLink>({
        template: html`<atomic-generated-answer-inline-link
          href=${props?.href ?? 'https://example.com'}
          answer-id=${props?.answerId ?? 'test-answer-id'}
          text=${props?.text ?? 'Example Link'}
          title=${props?.title ?? 'Example Title'}
        ></atomic-generated-answer-inline-link>`,
        selector: 'atomic-generated-answer-inline-link',
      });

    const anchor = element.shadowRoot?.querySelector('a');

    return {element, anchor};
  };

  it('should build the interactive inline link controller with the engine', async () => {
    const {element} = await setupElement();

    expect(buildInteractiveGeneratedAnswerInlineLink).toHaveBeenCalledWith(
      element.bindings.engine,
      {
        options: {
          answerId: 'test-answer-id',
          link: {
            linkText: 'Example Link',
            linkURL: 'https://example.com',
          },
        },
      }
    );
  });

  it('should render an anchor element in shadow DOM', async () => {
    const {anchor} = await setupElement();

    expect(anchor).not.toBeNull();
    expect(anchor?.getAttribute('href')).toBe('https://example.com');
    expect(anchor?.getAttribute('target')).toBe('_blank');
    expect(anchor?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('should pass title to the rendered anchor', async () => {
    const {anchor} = await setupElement({title: 'Custom Title'});

    expect(anchor?.getAttribute('title')).toBe('Custom Title');
  });

  it('should render the answer-link part on the anchor', async () => {
    const {anchor} = await setupElement();

    expect(anchor?.getAttribute('part')).toBe('answer-link');
  });

  it('should call select on click', async () => {
    const {anchor} = await setupElement();

    anchor?.dispatchEvent(new MouseEvent('click', {bubbles: true}));

    expect(mockedInteractiveLink.select).toHaveBeenCalled();
  });

  it('should call select on contextmenu', async () => {
    const {anchor} = await setupElement();

    anchor?.dispatchEvent(new MouseEvent('contextmenu', {bubbles: true}));

    expect(mockedInteractiveLink.select).toHaveBeenCalled();
  });

  it('should call select on mousedown', async () => {
    const {anchor} = await setupElement();

    anchor?.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));

    expect(mockedInteractiveLink.select).toHaveBeenCalled();
  });

  it('should call select on mouseup', async () => {
    const {anchor} = await setupElement();

    anchor?.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}));

    expect(mockedInteractiveLink.select).toHaveBeenCalled();
  });

  it('should call beginDelayedSelect on touchstart', async () => {
    const {anchor} = await setupElement();

    anchor?.dispatchEvent(new Event('touchstart', {bubbles: true}));

    expect(mockedInteractiveLink.beginDelayedSelect).toHaveBeenCalled();
  });

  it('should call cancelPendingSelect on touchend', async () => {
    const {anchor} = await setupElement();

    anchor?.dispatchEvent(new Event('touchend', {bubbles: true}));

    expect(mockedInteractiveLink.cancelPendingSelect).toHaveBeenCalled();
  });

  it('should not build the controller when answerId is empty', async () => {
    vi.mocked(buildInteractiveGeneratedAnswerInlineLink).mockClear();

    await setupElement({answerId: ''});

    expect(buildInteractiveGeneratedAnswerInlineLink).not.toHaveBeenCalled();
  });

  it('should not build the controller when href is empty', async () => {
    vi.mocked(buildInteractiveGeneratedAnswerInlineLink).mockClear();

    await setupElement({href: ''});

    expect(buildInteractiveGeneratedAnswerInlineLink).not.toHaveBeenCalled();
  });
});
