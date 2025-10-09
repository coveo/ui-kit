import {ResultTemplatesHelpers} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import type {AtomicResultTemplate} from './atomic-result-template';
import './atomic-result-template';

vi.mock('@/src/components/common/template-controller/template-utils', {
  spy: true,
});

describe('AtomicResultTemplate', () => {
  let element: AtomicResultTemplate;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly', async () => {
    const container = document.createElement('atomic-result-list');
    element = await fixture<AtomicResultTemplate>(
      html`
      <atomic-result-template>
        <template><div>Result content</div></template>
      </atomic-result-template>
    `,
      container
    );

    expect(element).toBeDefined();
    expect(element.tagName.toLowerCase()).toBe('atomic-result-template');
  });

  it('should render with default properties', async () => {
    const container = document.createElement('atomic-result-list');
    element = await fixture<AtomicResultTemplate>(
      html`
      <atomic-result-template>
        <template slot="default"><div>Result content</div></template>
      </atomic-result-template>
    `,
      container
    );

    expect(element.conditions).toEqual([]);
    expect(element.mustMatch).toEqual({});
    expect(element.mustNotMatch).toEqual({});
  });

  describe('properties', () => {
    beforeEach(async () => {
      const container = document.createElement('atomic-result-list');
      element = await fixture<AtomicResultTemplate>(
        html`
        <atomic-result-template>
          <template slot="default"><div>Result content</div></template>
        </atomic-result-template>
      `,
        container
      );
    });

    it('should handle conditions property correctly', () => {
      const conditions = [
        (result: unknown) => (result as {title: string}).title.includes('test'),
      ];
      element.conditions = conditions;

      expect(element.conditions).toEqual(conditions);
    });

    it('should handle mustMatch property correctly', () => {
      const mustMatch = {filetype: ['pdf', 'doc'], source: ['web']};
      element.mustMatch = mustMatch;

      expect(element.mustMatch).toEqual(mustMatch);
    });

    it('should handle mustNotMatch property correctly', () => {
      const mustNotMatch = {filetype: ['html'], author: ['anonymous']};
      element.mustNotMatch = mustNotMatch;

      expect(element.mustNotMatch).toEqual(mustNotMatch);
    });

    it('should handle both mustMatch and mustNotMatch conditions', () => {
      const mustMatch = {filetype: ['pdf', 'doc']};
      const mustNotMatch = {source: ['spam']};

      element.mustMatch = mustMatch;
      element.mustNotMatch = mustNotMatch;

      expect(element.mustMatch).toEqual(mustMatch);
      expect(element.mustNotMatch).toEqual(mustNotMatch);
    });
  });

  describe('#connectedCallback', () => {
    it('should initialize ResultTemplateController on connection', async () => {
      const container = document.createElement('atomic-result-list');
      element = await fixture<AtomicResultTemplate>(
        html`
        <atomic-result-template>
          <template slot="default"><div>Result content</div></template>
        </atomic-result-template>
      `,
        container
      );

      expect(element['resultTemplateController']).toBeDefined();
      expect(element['resultTemplateController']).toBeInstanceOf(Object);
    });

    it('should set error when not placed in valid parent', async () => {
      const container = await fixture(html`
        <div>
          <atomic-result-template>
            <template slot="default"><div>content</div></template>
          </atomic-result-template>
        </div>
      `);

      const resultTemplate = container.querySelector(
        'atomic-result-template'
      ) as unknown as AtomicResultTemplate;

      expect(resultTemplate.error).toBeInstanceOf(Error);
      expect(resultTemplate.error?.message).toContain('has to be the child');
    });
  });

  describe('#willUpdate', () => {
    beforeEach(async () => {
      const container = document.createElement('atomic-result-list');
      element = await fixture<AtomicResultTemplate>(
        html`
        <atomic-result-template>
          <template slot="default"><div>Result content</div></template>
        </atomic-result-template>
      `,
        container
      );
    });

    it('should call makeMatchConditions with correct parameters', async () => {
      const {makeMatchConditions} = await import(
        '@/src/components/common/template-controller/template-utils'
      );
      const mockedMakeMatchConditions = vi.mocked(makeMatchConditions);

      const mustMatch = {filetype: ['pdf']};
      const mustNotMatch = {source: ['spam']};

      element.mustMatch = mustMatch;
      element.mustNotMatch = mustNotMatch;

      element.requestUpdate();
      await element.updateComplete;

      expect(mockedMakeMatchConditions).toHaveBeenCalledWith(
        mustMatch,
        mustNotMatch,
        ResultTemplatesHelpers
      );
    });

    it('should update match conditions on willUpdate', async () => {
      const {makeMatchConditions} = await import(
        '@/src/components/common/template-controller/template-utils'
      );
      vi.mocked(makeMatchConditions).mockReturnValue([() => true]);

      element.mustMatch = {filetype: ['pdf']};

      element.requestUpdate();
      await element.updateComplete;

      expect(element['resultTemplateController'].matchConditions).toEqual([
        expect.any(Function),
      ]);
    });
  });

  describe('#render', () => {
    it('should render nothing when no error exists', async () => {
      const container = document.createElement('atomic-result-list');
      element = await fixture<AtomicResultTemplate>(
        html`
        <atomic-result-template>
          <template slot="default"><div>Result content</div></template>
        </atomic-result-template>
      `,
        container
      );
      await element.updateComplete;

      const shadowContent = element.shadowRoot?.children.length;
      expect(shadowContent).toBe(0);
    });

    it('should render error component when error exists', async () => {
      const container = await fixture(html`
        <div>
          <atomic-result-template>
            <template slot="default"><div>content</div></template>
          </atomic-result-template>
        </div>
      `);

      const resultTemplate = container.querySelector(
        'atomic-result-template'
      ) as unknown as AtomicResultTemplate;
      await resultTemplate.updateComplete;

      const errorComponent = resultTemplate.shadowRoot?.querySelector(
        'atomic-component-error'
      );
      expect(errorComponent).toBeDefined();
    });

    it('should preserve error state across updates', async () => {
      const container = await fixture(html`
        <div>
          <atomic-result-template>
            <template slot="default"><div>content</div></template>
          </atomic-result-template>
        </div>
      `);

      const resultTemplate = container.querySelector(
        'atomic-result-template'
      ) as unknown as AtomicResultTemplate;
      const firstError = resultTemplate.error;

      resultTemplate.requestUpdate();
      await resultTemplate.updateComplete;

      expect(resultTemplate.error).toBe(firstError);
    });
  });

  describe('#getTemplate', () => {
    it('should call ResultTemplateController getTemplate method with the conditions', async () => {
      const container = document.createElement('atomic-result-list');
      element = await fixture<AtomicResultTemplate>(
        html`
        <atomic-result-template>
          <template><div class="result">Test content</div></template>
        </atomic-result-template>
      `,
        container
      );

      const conditions = [
        (result: unknown) => (result as {title: string}).title.includes('test'),
      ];
      element.conditions = conditions;

      const controllerSpy = vi.spyOn(
        element['resultTemplateController'],
        'getTemplate'
      );

      element.getTemplate();

      expect(controllerSpy).toHaveBeenCalledWith(conditions);
    });

    it('should return null from getTemplate when there is an error', async () => {
      const container = await fixture(html`
        <div>
          <atomic-result-template>
            <template slot="default"><div>content</div></template>
          </atomic-result-template>
        </div>
      `);

      const resultTemplate = container.querySelector(
        'atomic-result-template'
      ) as unknown as AtomicResultTemplate;
      const template = resultTemplate.getTemplate();

      expect(template).toBeNull();
    });
  });
});
