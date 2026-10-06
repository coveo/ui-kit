import type {InteractiveSpotlightContent, SpotlightContent} from '@coveo/headless/commerce';
import {html, LitElement, nothing, type TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {
  interactiveSpotlightContentContextEventName,
  spotlightContentContextEventName,
} from '@/src/components/commerce/spotlight-content-template-component-utils/context/spotlight-content-context-controller';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import type {CommerceBindings} from '../../../../../src/components/commerce/atomic-commerce-interface/atomic-commerce-interface.js';
import {fixture} from '../../../fixture.js';
import {
  defaultBindings as commerceDefaultBindings,
  type FixtureAtomicCommerceInterface,
  renderInAtomicCommerceInterface,
} from './atomic-commerce-interface-fixture.js';

@customElement('atomic-spotlight-content')
@withTailwindStyles
export class FixtureAtomicSpotlightContent extends LitElement {
  @state() template!: TemplateResult;
  @property({type: Object}) spotlightContent?: SpotlightContent;
  @property({type: Object}) interactiveSpotlightContent?: InteractiveSpotlightContent;

  get ready() {
    return Boolean(this.template);
  }

  setRenderTemplate(template: TemplateResult) {
    this.template = template;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener(spotlightContentContextEventName, this.resolveSpotlightContent);
    this.addEventListener(
      interactiveSpotlightContentContextEventName,
      this.resolveInteractiveSpotlightContent
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(spotlightContentContextEventName, this.resolveSpotlightContent);
    this.removeEventListener(
      interactiveSpotlightContentContextEventName,
      this.resolveInteractiveSpotlightContent
    );
  }

  private resolveSpotlightContent = (event: Event) => {
    const customEvent = event as CustomEvent;
    customEvent.preventDefault();
    customEvent.stopPropagation();
    if (this.spotlightContent && typeof customEvent.detail === 'function') {
      customEvent.detail(this.spotlightContent);
    }
  };

  private resolveInteractiveSpotlightContent = (event: Event) => {
    const customEvent = event as CustomEvent;
    customEvent.preventDefault();
    customEvent.stopPropagation();
    if (this.interactiveSpotlightContent && typeof customEvent.detail === 'function') {
      customEvent.detail(this.interactiveSpotlightContent);
    }
  };

  protected render() {
    return this.ready ? this.template : nothing;
  }
}

type MinimalBindings = Partial<CommerceBindings> & typeof commerceDefaultBindings;

export async function renderInAtomicSpotlightContent<T extends LitElement>({
  template,
  selector,
  bindings,
  spotlightContent,
  interactiveSpotlightContent,
}: {
  template: TemplateResult;
  selector: string;
  bindings?: Partial<CommerceBindings> | ((bindings: MinimalBindings) => MinimalBindings);
  spotlightContent?: SpotlightContent;
  interactiveSpotlightContent?: InteractiveSpotlightContent;
}): Promise<{
  element: T;
  atomicSpotlightContent: FixtureAtomicSpotlightContent;
  atomicInterface: FixtureAtomicCommerceInterface;
}> {
  const atomicSpotlightContent = await fixture<FixtureAtomicSpotlightContent>(
    html`<atomic-spotlight-content
      .spotlightContent=${spotlightContent}
      .interactiveSpotlightContent=${interactiveSpotlightContent}
    ></atomic-spotlight-content>`
  );

  atomicSpotlightContent.setRenderTemplate(template);

  const {atomicInterface} = await renderInAtomicCommerceInterface({
    template: html`${atomicSpotlightContent}`,
    bindings,
  });

  await atomicSpotlightContent.updateComplete;
  await atomicInterface.updateComplete;

  const element = atomicSpotlightContent.shadowRoot!.querySelector<T>(selector)!;
  await element?.updateComplete;

  return {element, atomicSpotlightContent, atomicInterface};
}
