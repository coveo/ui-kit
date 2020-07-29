import {bindLogDocumentOpenOnResult} from './result-utils';
jest.mock('@coveo/headless/dist/api/analytics/analytics');
import {TestUtils, Result, ResultAnalyticsActions} from '@coveo/headless';
import {newSpecPage} from '@stencil/core/testing';

describe('bindLogDocumentOpenOnResult', () => {
  let engine: TestUtils.MockEngine;
  let result: Result;
  let resultElement: Element;
  beforeEach(async () => {
    engine = TestUtils.buildMockEngine();
    result = TestUtils.buildMockResult();
    result.clickUri = 'https://www.coveo.com';
    const page = await newSpecPage({
      components: [],
      html: `<div><a href="${result.clickUri}">Link</a></div>`,
    });
    resultElement = page.root!;
  });

  describe('events listeners', () => {
    function testLogDocumentOpenAction() {
      const action = engine.actions.find(
        (a) => a.type === ResultAnalyticsActions.logDocumentOpen.pending.type
      );
      expect(engine.actions[0]).toEqual(
        ResultAnalyticsActions.logDocumentOpen.pending(
          action!.meta.requestId,
          result
        )
      );
    }

    let linkElement: HTMLElement;

    beforeEach(() => {
      bindLogDocumentOpenOnResult(engine, result, resultElement);
      linkElement = resultElement.querySelector('a')!;
    });

    it('should dispatch logDocumentOpen on click', () => {
      linkElement.click();
      testLogDocumentOpenAction();
    });

    it('should dispatch logDocumentOpen on contextmenu', () => {
      linkElement.dispatchEvent(new window.CustomEvent('contextmenu'));
      testLogDocumentOpenAction();
    });

    it('should dispatch logDocumentOpen on mouseup', () => {
      linkElement.dispatchEvent(new window.CustomEvent('mouseup'));
      testLogDocumentOpenAction();
    });

    it('should dispatch logDocumentOpen on mousedown', () => {
      linkElement.dispatchEvent(new window.CustomEvent('mousedown'));
      testLogDocumentOpenAction();
    });

    it('should dispatch logDocumentOpen only once', () => {
      linkElement.dispatchEvent(new window.CustomEvent('mouseup'));
      linkElement.dispatchEvent(new window.CustomEvent('mousedown'));
      expect(engine.actions.length).toBe(1);
    });

    it('should dispatch logDocumentOpen on a longpress of over 1s', (done) => {
      const originalError = console.error;
      console.error = jest.fn();
      linkElement.dispatchEvent(new window.CustomEvent('touchstart'));
      setTimeout(() => {
        testLogDocumentOpenAction();
        console.error = originalError;
        done();
      }, 1100);
    });
  });
});
