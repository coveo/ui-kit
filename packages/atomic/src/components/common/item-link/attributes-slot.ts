import {getNamedSlotContent} from '@/src/utils/slot-utils';

export function getAttributesFromLinkSlotContent(
  host: HTMLElement,
  slotName: string
) {
  const namedSlotContent = getNamedSlotContent(host, slotName);
  if (namedSlotContent.length === 0) {
    return;
  }

  if (namedSlotContent.length > 1) {
    console.warn(
      `More than one element found for slot "${slotName}", only the first one will be used.`,
      host
    );
  }

  const attributesSlotContent = namedSlotContent[0];

  if (attributesSlotContent.nodeName !== 'A') {
    console.warn(
      `Slot named "${slotName}" should be an "a" tag`,
      attributesSlotContent
    );
    return;
  }

  return Array.from(attributesSlotContent.attributes).filter(({nodeName}) => {
    if (nodeName === 'slot') {
      return false;
    }

    if (nodeName === 'href') {
      console.warn(
        'The "href" attribute set on the "attributes" slot element will be ignored.'
      );
      return false;
    }

    return true;
  });
}
