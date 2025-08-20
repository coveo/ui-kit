import type {HTMLStencilElement} from '@stencil/core/internal';
import {LitElement} from 'lit';
import type {Constructor} from './mixin-common';

export const ChildrenUpdateCompleteMixin = <T extends Constructor<LitElement>>(
  superClass: T
) => {
  class ChildrenUpdateCompleteMixinClass extends superClass {
    async getUpdateComplete(): Promise<boolean> {
      const baseUpdateComplete = await super.getUpdateComplete();

      const children = Array.from(this.querySelectorAll('*'));
      this.shadowRoot
        ?.querySelectorAll('*')
        .forEach((child) => children.push(child));

      await Promise.all(
        children.map(async (child) => {
          if (child instanceof LitElement) {
            // @ts-expect-error Atomic elements have an `error` property.
            if (child.error) {
              /**
               * If the child has an error, we don't wait for it to update since
               * updateComplete hangs indefinitely if an error is thrown during rendering.
               * This hanging behaviour is out of our control and is from Lit.
               */
              return;
            }
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
