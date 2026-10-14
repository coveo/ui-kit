import type {SpotlightContent} from '@coveo/headless/commerce';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {makeMatchConditions} from '@/src/components/common/template-controller/template-utils';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFakeSpotlightContent} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/spotlight-content';
import {AtomicSpotlightContentTemplate} from './atomic-spotlight-content-template';
import './atomic-spotlight-content-template';

vi.mock('@/src/components/common/template-controller/template-utils', {spy: true});

describe('atomic-spotlight-content-template', () => {
  const setupElement = async ({
    parent = 'atomic-commerce-product-list',
    conditions = [],
    mustMatch = {},
    mustNotMatch = {},
  }: {
    parent?: 'atomic-commerce-product-list' | 'div';
    conditions?: AtomicSpotlightContentTemplate['conditions'];
    mustMatch?: Record<string, string[]>;
    mustNotMatch?: Record<string, string[]>;
  } = {}) => {
    const templateElement = html`<atomic-spotlight-content-template
      .conditions=${conditions}
      .mustMatch=${mustMatch}
      .mustNotMatch=${mustNotMatch}
    >
      <template><atomic-product-image></atomic-product-image></template>
    </atomic-spotlight-content-template>`;

    const {element} = await renderInAtomicCommerceInterface<AtomicSpotlightContentTemplate>({
      template:
        parent === 'div'
          ? html`<div>${templateElement}</div>`
          : html`<atomic-commerce-product-list>${templateElement}</atomic-commerce-product-list>`,
      selector: 'atomic-spotlight-content-template',
    });
    return element;
  };

  it('should be defined', async () => {
    const element = await setupElement();

    expect(element).toBeInstanceOf(AtomicSpotlightContentTemplate);
  });

  it('should build match conditions with the spotlight content template helpers', async () => {
    await setupElement({mustMatch: {id: ['summer']}, mustNotMatch: {name: ['winter']}});

    expect(makeMatchConditions).toHaveBeenCalledWith(
      {id: ['summer']},
      {name: ['winter']},
      expect.objectContaining({getSpotlightContentProperty: expect.any(Function)})
    );
  });

  it('should return a template with the template content', async () => {
    const element = await setupElement();

    const template = await element.getTemplate();

    expect(template?.content.querySelector('atomic-product-image')).not.toBeNull();
  });

  it('should default the link content to an atomic-product-link', async () => {
    const element = await setupElement();

    const template = await element.getTemplate();

    expect(template?.linkContent?.querySelector('atomic-product-link')).not.toBeNull();
  });

  it('should include the conditions and the match conditions in the template', async () => {
    const isSummerSale = (spotlightContent: SpotlightContent) => spotlightContent.id === 'summer';
    const element = await setupElement({
      conditions: [isSummerSale],
      mustNotMatch: {name: ['winter']},
    });

    const template = await element.getTemplate();
    const matches = (spotlightContent: SpotlightContent) =>
      template!.conditions.every((condition) => condition(spotlightContent));

    expect(matches(buildFakeSpotlightContent({id: 'summer', name: 'Summer'}))).toBe(true);
    expect(matches(buildFakeSpotlightContent({id: 'summer', name: 'Winter'}))).toBe(false);
    expect(matches(buildFakeSpotlightContent({id: 'other', name: 'Summer'}))).toBe(false);
  });

  it('should return null and set an error when not a child of atomic-commerce-product-list', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const element = await setupElement({parent: 'div'});

    expect(await element.getTemplate()).toBeNull();
    expect(element.error).toBeInstanceOf(Error);
  });
});
