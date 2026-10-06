import type {SpotlightContent} from '@coveo/headless/commerce';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {describe, expect, it} from 'vitest';
import {renderInAtomicSpotlightContent} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-spotlight-content-fixture';
import {buildFakeSpotlightContent} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/spotlight-content';
import type {AtomicSpotlightContentText} from './atomic-spotlight-content-text';
import './atomic-spotlight-content-text';

describe('atomic-spotlight-content-text', () => {
  const renderText = async ({
    field,
    defaultValue,
    spotlightContent = buildFakeSpotlightContent(),
  }: {
    field: string;
    defaultValue?: string;
    spotlightContent?: SpotlightContent;
  }) => {
    const {element} = await renderInAtomicSpotlightContent<AtomicSpotlightContentText>({
      template: html`<atomic-spotlight-content-text
        field=${field}
        default=${ifDefined(defaultValue)}
      ></atomic-spotlight-content-text>`,
      selector: 'atomic-spotlight-content-text',
      spotlightContent,
    });
    return {element, text: element.shadowRoot!.querySelector('[part="text"]')};
  };

  it('should render the value of the field', async () => {
    const {text} = await renderText({
      field: 'name',
      spotlightContent: buildFakeSpotlightContent({name: 'Summer sale'}),
    });

    expect(text).toHaveTextContent('Summer sale');
  });

  it('should apply the font color of the field', async () => {
    const {text} = await renderText({
      field: 'description',
      spotlightContent: buildFakeSpotlightContent({descriptionFontColor: '#00ff00'}),
    });

    expect(text).toHaveStyle({color: 'rgb(0, 255, 0)'});
  });

  it('should be hidden when the field has no value and there is no default', async () => {
    const {element, text} = await renderText({
      field: 'description',
      spotlightContent: buildFakeSpotlightContent({description: undefined}),
    });

    expect(text).toBeNull();
    expect(element.hidden).toBe(true);
  });

  it('should render the default text when the field has no value', async () => {
    const {element, text} = await renderText({
      field: 'description',
      defaultValue: 'no-title',
      spotlightContent: buildFakeSpotlightContent({description: undefined}),
    });

    expect(text).not.toBeNull();
    expect(element.hidden).toBe(false);
  });
});
