import {buildInteractiveResult, type InteractiveResult, type SearchEngine} from '@coveo/headless';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import {bindLogDocumentOpenOnResult} from './cdn-bind-log-document-open-on-result';

vi.mock('@coveo/headless', {spy: true});

describe('#bindLogDocumentOpenOnResult on the CDN', () => {
  const result = buildFakeResult();
  let engine: SearchEngine;
  let interactiveResult: InteractiveResult;
  let resultElement: HTMLElement;
  let link: HTMLAnchorElement;

  const pendingPromisesSettled = () => new Promise((resolve) => setTimeout(resolve));

  beforeEach(() => {
    engine = buildFakeSearchEngine();
    interactiveResult = {
      select: vi.fn(),
      beginDelayedSelect: vi.fn(),
      cancelPendingSelect: vi.fn(),
    };
    vi.mocked(buildInteractiveResult).mockReset();
    vi.mocked(buildInteractiveResult).mockReturnValue(interactiveResult);
    resultElement = document.createElement('div');
    link = document.createElement('a');
    resultElement.append(link);
  });

  it('should build the interactive result with the engine and the result', async () => {
    bindLogDocumentOpenOnResult(engine, result, resultElement);

    await vi.waitFor(() =>
      expect(buildInteractiveResult).toHaveBeenCalledExactlyOnceWith(engine, {options: {result}})
    );
  });

  it.each(['contextmenu', 'click', 'mouseup', 'mousedown'])(
    'should select the result on %s',
    async (eventName) => {
      bindLogDocumentOpenOnResult(engine, result, resultElement);

      link.dispatchEvent(new Event(eventName));

      await vi.waitFor(() => expect(interactiveResult.select).toHaveBeenCalledOnce());
    }
  );

  it('should begin a delayed select on touchstart', async () => {
    bindLogDocumentOpenOnResult(engine, result, resultElement);

    link.dispatchEvent(new Event('touchstart'));

    await vi.waitFor(() => expect(interactiveResult.beginDelayedSelect).toHaveBeenCalledOnce());
  });

  it('should cancel the pending select on touchend', async () => {
    bindLogDocumentOpenOnResult(engine, result, resultElement);

    link.dispatchEvent(new Event('touchend'));

    await vi.waitFor(() => expect(interactiveResult.cancelPendingSelect).toHaveBeenCalledOnce());
  });

  it('should keep an event that fires before Headless has loaded', async () => {
    bindLogDocumentOpenOnResult(engine, result, resultElement);

    link.dispatchEvent(new Event('click'));

    expect(interactiveResult.select).not.toHaveBeenCalled();
    await vi.waitFor(() => expect(interactiveResult.select).toHaveBeenCalledOnce());
  });

  it('should bind the elements that match the selector', async () => {
    const button = document.createElement('button');
    resultElement.append(button);
    bindLogDocumentOpenOnResult(engine, result, resultElement, 'button');

    link.dispatchEvent(new Event('click'));
    button.dispatchEvent(new Event('click'));

    await vi.waitFor(() => expect(interactiveResult.select).toHaveBeenCalledOnce());
  });

  it('should stop selecting the result once unbound', async () => {
    const unbind = bindLogDocumentOpenOnResult(engine, result, resultElement);
    await vi.waitFor(() => expect(buildInteractiveResult).toHaveBeenCalled());

    unbind();
    link.dispatchEvent(new Event('click'));
    await pendingPromisesSettled();

    expect(interactiveResult.select).not.toHaveBeenCalled();
  });

  it('should log an error when the interactive result cannot be built', async () => {
    const error = new Error('Headless is missing');
    vi.mocked(buildInteractiveResult).mockImplementation(() => {
      throw error;
    });
    bindLogDocumentOpenOnResult(engine, result, resultElement);

    link.dispatchEvent(new Event('click'));

    await vi.waitFor(() =>
      expect(engine.logger.error).toHaveBeenCalledExactlyOnceWith(error, expect.any(String))
    );
    expect(interactiveResult.select).not.toHaveBeenCalled();
  });
});
