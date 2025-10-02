import {getNamedSlotContent} from '../../../utils/slot-utils';

// TODO: should warn!!!
export function getAttributesFromLinkSlot(host: HTMLElement, slotName: string) {
  const namedSlots = getNamedSlotContent(host, slotName);
  if (namedSlots.length === 0) {
    return;
  }

  if (namedSlots.length > 1) {
    console.warn(`Element should only have 1 slot named "${slotName}".`, host);
  }

  const attributesSlot = namedSlots[0];

  if (attributesSlot.nodeName !== 'A') {
    console.warn(
      `Slot named "${slotName}" should be an "a" tag`,
      attributesSlot
    );
    return;
  }

  return Array.from(attributesSlot.attributes).filter(({nodeName}) => {
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
