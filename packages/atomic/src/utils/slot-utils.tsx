import {ComponentInterface} from '@stencil/core';

const renderWhenPropertyDefined = (
  component: ComponentInterface,
  property: string
) => {
  const {render} = component;
  component.render = function () {
    if (!this[property]) {
      return;
    }

    return render && render.call(this);
  };
};

export function ParentController() {
  return renderWhenPropertyDefined;
}

export function ParentState() {
  return renderWhenPropertyDefined;
}

export function ParentOptions() {
  return renderWhenPropertyDefined;
}

export function passControllerAndStateToSlot(
  e: Event,
  controller: unknown,
  state: unknown,
  options: unknown,
  slotsToClear?: string[]
) {
  const target = e.target as HTMLSlotElement;
  target.firstChild && target.removeChild(target.firstChild);
  slotsToClear?.forEach((slotname) => {
    target.parentNode?.querySelector(`slot[name="${slotname}"]`)?.remove();
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const node = target.assignedNodes()[0] as any;
  node.controller = controller;
  node.state = state;
  node.options = options;
}
