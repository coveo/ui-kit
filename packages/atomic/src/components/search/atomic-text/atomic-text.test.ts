import {expect, test, vi, suite} from 'vitest';
import './atomic-text';
import {AtomicText} from './atomic-text';

vi.mock('@coveo/headless', () => ({
  getSampleSearchEngineConfiguration: vi.fn(() => ({
    organizationId: 'mock-org-id',
  })),
}));

suite('AtomicText', () => {
  let el: AtomicText;

  beforeAll(async () => {
    el = document.createElement('atomic-text') as AtomicText;
    document.body.appendChild(el);
  });

  // afterAll(() => {
  //   document.body.removeChild(el);
  // });

  test('should mock the organizationId', async () => {
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).toBe('mock-org-id');
  });
});
