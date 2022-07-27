export function getNamedSlotFromHost(host: HTMLElement, slotName: string) {
  const children = Array.from(host.children);
  const targetSlot = children.filter(
    (child) => child.getAttribute('slot') === slotName
  );

  if (!targetSlot.length) {
    return;
  }

  if (targetSlot.length > 1) {
    console.warn(`Element should only have 1 slot named "${slotName}".`, host);
  }

  return targetSlot[0];
}

export function getDefaultSlotFromHost(host: HTMLElement) {
  const children = Array.from(host.children);
  const defaultSlot = children.filter(
    (child) => !child.hasAttribute('slot') || child.getAttribute('slot') === ''
  );

  if (!defaultSlot.length) {
    return;
  }

  if (defaultSlot.length > 1) {
    console.warn('Element should only have 1 default slot.', host);
  }

  return defaultSlot[0];
}
