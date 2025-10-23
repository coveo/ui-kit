import type {LightDOMWithSlots} from '@/src/mixins/slots-for-no-shadow-dom-mixin';

function hasLightDOMSlotContent(
  element: HTMLElement
): element is HTMLElement & LightDOMWithSlots {
  return (
    'slotContent' in element &&
    typeof (element as HTMLElement & LightDOMWithSlots).slotContent === 'object'
  );
}

export function getNamedSlotContent(
  host: HTMLElement,
  slotName: string
): Element[] {
  if (hasLightDOMSlotContent(host)) {
    const targetLightDomSlotContent = host.slotContent[slotName];

    return (
      targetLightDomSlotContent?.filter(
        (node: ChildNode): node is Element => node instanceof Element
      ) || []
    );
  }

  const children = Array.from(host.children);
  return children.filter((child) => child.getAttribute('slot') === slotName);
}

export function getDefaultSlotContent(host: HTMLElement): Element[] {
  const children = Array.from(host.children);
  return children.filter(
    (child) => !child.hasAttribute('slot') || child.getAttribute('slot') === ''
  );
}
