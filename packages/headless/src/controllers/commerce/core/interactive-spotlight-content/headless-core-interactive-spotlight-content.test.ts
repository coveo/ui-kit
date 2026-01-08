import {configuration} from '../../../../app/common-reducers.js';
import {spotlightContentClick} from '../../../../features/commerce/spotlight-content/spotlight-content-actions.js';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state.js';
import {
  buildMockCommerceEngine,
  type MockedCommerceEngine,
} from '../../../../test/mock-engine-v2.js';
import {buildMockSpotlightContent} from '../../../../test/mock-spotlight-content.js';
import {buildCoreInteractiveSpotlightContent} from './headless-core-interactive-spotlight-content.js';

vi.mock(
  '../../../../features/commerce/spotlight-content/spotlight-content-actions'
);

describe('core interactive spotlight content', () => {
  let engine: MockedCommerceEngine;

  const spotlightContent = buildMockSpotlightContent({
    id: 'spotlight-1-id',
    desktopImage: 'https://example.com/desktop.jpg',
    position: 1,
    responseId: 'spotlight-response-id',
  });

  function initializeInteractiveSpotlightContent() {
    buildCoreInteractiveSpotlightContent(engine, {
      options: {
        spotlightContent,
      },
      responseIdSelector: () => 'state-response-id',
    });
  }

  beforeEach(() => {
    engine = buildMockCommerceEngine(buildMockCommerceState());
    initializeInteractiveSpotlightContent();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({configuration});
  });

  describe('#select', () => {
    it('when id and desktopImage are defined on the spotlight content, dispatches spotlightContentClick with the correct payload', () => {
      const controller = buildCoreInteractiveSpotlightContent(engine, {
        options: {
          spotlightContent,
        },
        responseIdSelector: () => 'responseId',
      });

      controller.select();

      expect(spotlightContentClick).toHaveBeenCalledWith({
        id: spotlightContent.id,
        desktopImage: spotlightContent.desktopImage,
        position: spotlightContent.position,
        responseId: 'spotlight-response-id',
      });
    });

    it('when spotlight content has responseId, uses spotlight content responseId instead of responseIdSelector', () => {
      const controller = buildCoreInteractiveSpotlightContent(engine, {
        options: {
          spotlightContent,
        },
        responseIdSelector: () => 'state-response-id',
      });

      controller.select();

      expect(spotlightContentClick).toHaveBeenCalledWith({
        id: spotlightContent.id,
        desktopImage: spotlightContent.desktopImage,
        position: spotlightContent.position,
        responseId: 'spotlight-response-id',
      });
    });

    it('when spotlight content has no responseId, falls back to responseIdSelector', () => {
      const spotlightContentWithoutResponseId = buildMockSpotlightContent({
        ...spotlightContent,
        responseId: undefined,
      });

      const controller = buildCoreInteractiveSpotlightContent(engine, {
        options: {
          spotlightContent: spotlightContentWithoutResponseId,
        },
        responseIdSelector: () => 'state-response-id',
      });

      controller.select();

      expect(spotlightContentClick).toHaveBeenCalledWith({
        id: spotlightContentWithoutResponseId.id,
        desktopImage: spotlightContentWithoutResponseId.desktopImage,
        position: spotlightContentWithoutResponseId.position,
        responseId: 'state-response-id',
      });
    });

    it('does not dispatch action on multiple calls', () => {
      const controller = buildCoreInteractiveSpotlightContent(engine, {
        options: {
          spotlightContent,
        },
        responseIdSelector: () => 'state-response-id',
      });

      controller.select();
      controller.select();

      expect(spotlightContentClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('#beginDelayedSelect', () => {
    it('dispatches #spotlightContentClick after the given delay', () => {
      vi.useFakeTimers();
      const controller = buildCoreInteractiveSpotlightContent(engine, {
        options: {
          spotlightContent,
          selectionDelay: 1000,
        },
        responseIdSelector: () => 'state-response-id',
      });

      controller.beginDelayedSelect();
      vi.advanceTimersByTime(1000);

      expect(spotlightContentClick).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });
  });

  describe('#cancelPendingSelect', () => {
    it('cancels the pending #spotlightContentClick action', () => {
      vi.useFakeTimers();
      const controller = buildCoreInteractiveSpotlightContent(engine, {
        options: {
          spotlightContent,
          selectionDelay: 1000,
        },
        responseIdSelector: () => 'state-response-id',
      });

      controller.beginDelayedSelect();
      controller.cancelPendingSelect();
      vi.advanceTimersByTime(1000);

      expect(spotlightContentClick).not.toHaveBeenCalled();
      vi.useRealTimers();
    });
  });

  describe('#warningMessage', () => {
    it('when id is missing, returns a warning message', () => {
      const spotlightContentWithoutId = buildMockSpotlightContent({
        ...spotlightContent,
        id: '',
      });

      const controller = buildCoreInteractiveSpotlightContent(engine, {
        options: {
          spotlightContent: spotlightContentWithoutId,
        },
        responseIdSelector: () => 'state-response-id',
      });

      expect(controller.warningMessage).toBeDefined();
      expect(controller.warningMessage).toContain('id');
    });

    it('when desktopImage is missing, returns a warning message', () => {
      const spotlightContentWithoutImage = buildMockSpotlightContent({
        ...spotlightContent,
        desktopImage: '',
      });

      const controller = buildCoreInteractiveSpotlightContent(engine, {
        options: {
          spotlightContent: spotlightContentWithoutImage,
        },
        responseIdSelector: () => 'state-response-id',
      });

      expect(controller.warningMessage).toBeDefined();
      expect(controller.warningMessage).toContain('desktopImage');
    });

    it('when all required properties are present, returns undefined', () => {
      const controller = buildCoreInteractiveSpotlightContent(engine, {
        options: {
          spotlightContent,
        },
        responseIdSelector: () => 'state-response-id',
      });

      expect(controller.warningMessage).toBeUndefined();
    });
  });
});
