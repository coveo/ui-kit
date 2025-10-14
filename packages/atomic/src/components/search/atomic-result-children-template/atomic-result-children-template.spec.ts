import type {Result} from '@coveo/headless';
import {ResultTemplatesHelpers} from '@coveo/headless';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {makeMatchConditions} from '@/src/components/common/template-controller/template-utils';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {sanitizeHtml} from '@/vitest-utils/testing-helpers/testing-utils/sanitize-html';
import {AtomicResultChildrenTemplate} from './atomic-result-children-template.js';

vi.mock('@/src/components/common/template-controller/template-utils', {
  spy: true,
});

describe('atomic-result-children-template', () => {
  type AtomicResultChildrenTemplateProps = Pick<
    AtomicResultChildrenTemplate,
    'conditions' | 'mustMatch' | 'mustNotMatch'
  >;

  const setupElement = async (
    options: Partial<AtomicResultChildrenTemplateProps> = {}
  ) => {
    const defaultProps: AtomicResultChildrenTemplateProps = {
      conditions: [],
      mustMatch: {},
      mustNotMatch: {},
    };

    const container = document.createElement('atomic-result-children');
    const element = await fixture<AtomicResultChildrenTemplate>(
      html`
        <atomic-result-children-template
          .conditions=${options.conditions || defaultProps.conditions}
          .mustMatch=${options.mustMatch || defaultProps.mustMatch}
          .mustNotMatch=${options.mustNotMatch || defaultProps.mustNotMatch}
        >
          <template>
            <div>Child Result Template Content</div>
          </template>
        </atomic-result-children-template>
      `,
      container
    );
    return element;
  };

  it('should instantiate without errors', async () => {
    const element = await setupElement();
    expect(element).toBeInstanceOf(AtomicResultChildrenTemplate);
  });

  it('should have default empty mustMatch, mustNotMatch and conditions', async () => {
    const element = await setupElement();
    expect(element.mustMatch).toEqual({});
    expect(element.mustNotMatch).toEqual({});
    expect(element.conditions).toEqual([]);
  });

  describe('when must-match and must-not-match attributes are set', () => {
    it('should call #makeMatchConditions on connectedCallback', async () => {
      const mockMakeMatchConditions = vi.mocked(makeMatchConditions);
      await setupElement({
        mustMatch: {filetype: ['lithiummessage', 'YouTubePlaylist']},
        mustNotMatch: {source: ['spam']},
      });
      expect(mockMakeMatchConditions).toHaveBeenCalledWith(
        {filetype: ['lithiummessage', 'YouTubePlaylist']},
        {source: ['spam']},
        ResultTemplatesHelpers
      );
    });

    it('should handle filetype matching conditions', async () => {
      const mockMakeMatchConditions = vi.mocked(makeMatchConditions);
      await setupElement({
        mustMatch: {filetype: ['lithiummessage']},
      });
      expect(mockMakeMatchConditions).toHaveBeenCalledWith(
        {filetype: ['lithiummessage']},
        {},
        ResultTemplatesHelpers
      );
    });

    it('should handle exclusion conditions', async () => {
      const mockMakeMatchConditions = vi.mocked(makeMatchConditions);
      await setupElement({
        mustNotMatch: {filetype: ['lithiummessage']},
      });
      expect(mockMakeMatchConditions).toHaveBeenCalledWith(
        {},
        {filetype: ['lithiummessage']},
        ResultTemplatesHelpers
      );
    });
  });

  describe('rendering', () => {
    it('should render nothing by default', async () => {
      const element = await setupElement();
      expect(sanitizeHtml(element.shadowRoot!.innerHTML)).toBe('');
    });

    it('should render an atomic-component-error when error occurs', async () => {
      const mockedConsoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const container = await fixture(html`
        <div>
          <atomic-result-children-template>
            <template><div>content</div></template>
          </atomic-result-children-template>
        </div>
      `);

      const element = container.querySelector(
        'atomic-result-children-template'
      ) as unknown as AtomicResultChildrenTemplate;

      await element.updateComplete;

      const errorComponent = element.shadowRoot?.querySelector(
        'atomic-component-error'
      );
      expect(errorComponent).toBeDefined();
      mockedConsoleError.mockRestore();
    });
  });

  describe('validation', () => {
    it('should require atomic-result-children as parent', async () => {
      const mockedConsoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const container = await fixture(html`
        <div>
          <atomic-result-children-template>
            <template><div>content</div></template>
          </atomic-result-children-template>
        </div>
      `);

      const element = container.querySelector(
        'atomic-result-children-template'
      ) as unknown as AtomicResultChildrenTemplate;

      await element.updateComplete;

      expect(element.error).toBeDefined();
      expect(element.error.message).toContain(
        'has to be the child of one of the following: "atomic-result-children"'
      );

      mockedConsoleError.mockRestore();
    });

    it('should require a template element as child', async () => {
      const mockedConsoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const container = document.createElement('atomic-result-children');
      const element = await fixture<AtomicResultChildrenTemplate>(
        html`<atomic-result-children-template></atomic-result-children-template>`,
        container
      );

      await element.updateComplete;

      expect(element.error).toBeDefined();
      expect(element.error.message).toContain(
        'must contain a "template" element as a child'
      );

      mockedConsoleError.mockRestore();
    });

    it('should not allow empty template by default', async () => {
      const mockedConsoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const container = document.createElement('atomic-result-children');
      const element = await fixture<AtomicResultChildrenTemplate>(
        html`
          <atomic-result-children-template>
            <template></template>
          </atomic-result-children-template>
        `,
        container
      );

      await element.updateComplete;

      expect(element.error).toBeDefined();
      expect(element.error.message).toContain('cannot be empty');

      mockedConsoleError.mockRestore();
    });
  });

  describe('getTemplate method', () => {
    it('should call #getTemplate on the controller with conditions', async () => {
      const titleConditions = (result: Result) =>
        result.title.includes('singapore');
      const element = await setupElement({conditions: [titleConditions]});
      const ctrl = element['resultTemplateController'];
      //@ts-expect-error: we don't really care about the return template here
      const spy = vi.spyOn(ctrl, 'getTemplate').mockResolvedValue('🎯');
      const result = await element.getTemplate();

      expect(spy).toHaveBeenCalledWith([titleConditions]);
      expect(result).toBe('🎯');
    });

    it('should return null when controller returns null', async () => {
      const element = await setupElement();
      const ctrl = element['resultTemplateController'];
      const spy = vi.spyOn(ctrl, 'getTemplate').mockResolvedValue(null);
      const result = await element.getTemplate();

      expect(spy).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should handle multiple conditions', async () => {
      const condition1 = (result: Result) => result.title === 'Test';
      const condition2 = (result: Result) => result.excerpt.length > 100;
      const element = await setupElement({
        conditions: [condition1, condition2],
      });
      const ctrl = element['resultTemplateController'];
      const spy = vi.spyOn(ctrl, 'getTemplate').mockResolvedValue(null);

      await element.getTemplate();

      expect(spy).toHaveBeenCalledWith([condition1, condition2]);
    });
  });
});
