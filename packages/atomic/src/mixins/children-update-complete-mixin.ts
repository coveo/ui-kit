import type {HTMLStencilElement} from '@stencil/core/internal';
import {LitElement} from 'lit';
import type {Constructor} from './mixin-common';

export const ChildrenUpdateCompleteMixin = <T extends Constructor<LitElement>>(
  superClass: T
) => {
  class ChildrenUpdateCompleteMixinClass extends superClass {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
    }

    async getUpdateComplete(): Promise<boolean> {
      const baseUpdateComplete = await super.getUpdateComplete();

      const children = Array.from(this.querySelectorAll('*'));
      this.shadowRoot
        ?.querySelectorAll('*')
        .forEach((child) => children.push(child));

      await Promise.all(
        children.map(async (child) => {
          if (child instanceof LitElement) {
            await child.updateComplete;
          } else if ('componentOnReady' in child) {
            await (child as HTMLStencilElement).componentOnReady();
          }
        })
      );
      return baseUpdateComplete;
    }
  }

  return ChildrenUpdateCompleteMixinClass as T;
};
