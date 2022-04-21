export function getSlotFromHost(host: HTMLElement, slotName: string) {
  const children = Array.from(host.children);
  const slots = children.filter((child) => {
    if (slotName) {
      return child.getAttribute('slot') === slotName;
    }

    return child.setAttribute('slot', '');
  });

  if (!slots.length) {
    return;
  }

  if (slots.length > 1) {
    const msg = slotName
      ? `Element should only have 1 slot named "${slotName}".`
      : 'Element should only have 1 default slot.';
    console.warn(msg, host);
  }

  return slots[0];
}
