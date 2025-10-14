import type {Result} from '@coveo/headless';
import {ResultTemplatesHelpers} from '@coveo/headless';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {makeMatchConditions} from '@/src/components/common/template-controller/template-utils';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {sanitizeHtml} from '@/vitest-utils/testing-helpers/testing-utils/sanitize-html';
import {AtomicResultTemplate} from './atomic-result-template.js';

vi.mock('@/src/components/common/template-controller/template-utils', {
  spy: true,
});

describe('atomic-result-template', () => {
  type AtomicResultTemplateProps = Pick<
    AtomicResultTemplate,
    'conditions' | 'mustMatch' | 'mustNotMatch'
  >;

  const setupElement = async (
    options: Partial<AtomicResultTemplateProps> = {}
  ) => {
    const defaultProps: AtomicResultTemplateProps = {
      conditions: [],
      mustMatch: {},
      mustNotMatch: {},
    };

    const container = document.createElement('atomic-result-list');
    const element = await fixture<AtomicResultTemplate>(
      html`
        <atomic-result-template
          .conditions=${options.conditions || defaultProps.conditions}
          .mustMatch=${options.mustMatch || defaultProps.mustMatch}
          .mustNotMatch=${options.mustNotMatch || defaultProps.mustNotMatch}
        >
          <template slot="default">
            <div>Result Template Content</div>
          </template>
        </atomic-result-template>
      `,
      container
    );
    return element;
  };

  it('should instantiate without errors', async () => {
    const element = await setupElement();
    expect(element).toBeInstanceOf(AtomicResultTemplate);
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
        mustMatch: {filetype: ['pdf']},
        mustNotMatch: {source: ['spam']},
      });
      expect(mockMakeMatchConditions).toHaveBeenCalledWith(
        {filetype: ['pdf']},
        {source: ['spam']},
        ResultTemplatesHelpers
      );
    });
  });

  it('should call #getTemplate on the controller', async () => {
    const titleConditions = (result: Result) => result.title === 'Coveo';
    const element = await setupElement({conditions: [titleConditions]});
    const ctrl = element['resultTemplateController'];
    //@ts-expect-error: we don't really care about the return template here
    const spy = vi.spyOn(ctrl, 'getTemplate').mockResolvedValue('🍰');
    const result = await element.getTemplate();

    expect(spy).toHaveBeenCalledWith([titleConditions]);
    expect(result).toBe('🍰');
  });

  it('should render nothing by default', async () => {
    const element = await setupElement();
    expect(sanitizeHtml(element.shadowRoot!.innerHTML)).toBe('');
  });

  it('should render an atomic-component-error if error is thrown', async () => {
    const mockedConsoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const container = await fixture(html`
      <div>
        <atomic-result-template>
          <template slot="default"><div>content</div></template>
        </atomic-result-template>
      </div>
    `);

    const element = container.querySelector(
      'atomic-result-template'
    ) as AtomicResultTemplate;

    await element.updateComplete;

    const errorComponent = element.shadowRoot?.querySelector(
      'atomic-component-error'
    );
    expect(errorComponent).toBeDefined();
    mockedConsoleError.mockRestore();
  });
});
