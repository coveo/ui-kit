import type {InteractiveSpotlightContent, SpotlightContent} from '@coveo/headless/commerce';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {renderInAtomicSpotlightContent} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-spotlight-content-fixture';
import {buildFakeInteractiveSpotlightContent} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/interactive-spotlight-content';
import {buildFakeSpotlightContent} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/spotlight-content';
import type {AtomicSpotlightContentLink} from './atomic-spotlight-content-link';
import './atomic-spotlight-content-link';

describe('atomic-spotlight-content-link', () => {
  const renderLink = async ({
    spotlightContent = buildFakeSpotlightContent(),
    interactiveSpotlightContent = buildFakeInteractiveSpotlightContent(),
    content = html``,
  }: {
    spotlightContent?: SpotlightContent;
    interactiveSpotlightContent?: InteractiveSpotlightContent;
    content?: ReturnType<typeof html>;
  } = {}) => {
    const warn = vi.fn();
    const {element} = await renderInAtomicSpotlightContent<AtomicSpotlightContentLink>({
      template: html`<atomic-spotlight-content-link>${content}</atomic-spotlight-content-link>`,
      selector: 'atomic-spotlight-content-link',
      spotlightContent,
      interactiveSpotlightContent,
      bindings: (bindings) => {
        bindings.engine.logger = {warn} as never;
        return bindings;
      },
    });
    const link = element.shadowRoot!.querySelector<HTMLAnchorElement>('[part="link"]')!;
    link.addEventListener('click', (event) => event.preventDefault());
    return {element, link, warn, interactiveSpotlightContent};
  };

  it('should link to the click URI', async () => {
    const {link} = await renderLink({
      spotlightContent: buildFakeSpotlightContent({clickUri: 'https://example.com/promo'}),
    });

    expect(link).toHaveAttribute('href', 'https://example.com/promo');
  });

  it('should render the name by default', async () => {
    const {link} = await renderLink();

    expect(link.querySelector('atomic-spotlight-content-text')).toHaveAttribute('field', 'name');
  });

  it('should render slotted content', async () => {
    const {element} = await renderLink({content: html`<span>Custom</span>`});

    const slot = element.shadowRoot!.querySelector('slot')!;
    expect(slot.assignedElements()[0]).toHaveTextContent('Custom');
  });

  it('should apply the attributes slot to the link', async () => {
    const {link} = await renderLink({
      content: html`<a slot="attributes" target="_blank"></a>`,
    });

    expect(link).toHaveAttribute('target', '_blank');
  });

  it('should call #select on the interactive spotlight content when clicked', async () => {
    const {link, interactiveSpotlightContent} = await renderLink();

    link.click();

    expect(interactiveSpotlightContent.select).toHaveBeenCalled();
  });

  it('should log the warning message of the interactive spotlight content when selected', async () => {
    const {link, warn} = await renderLink({
      interactiveSpotlightContent: buildFakeInteractiveSpotlightContent({
        warningMessage: 'missing metadata',
      }),
    });

    link.click();

    expect(warn).toHaveBeenCalledWith('missing metadata');
  });
});
