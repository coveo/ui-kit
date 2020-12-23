import {ComponentInterface, h} from '@stencil/core';

export function RenderError() {
  return (component: ComponentInterface, errorVariable: string) => {
    const {render} = component;

    component.render = function () {
      if (this[errorVariable]) {
        return (
          <atomic-component-error
            error={this[errorVariable]}
          ></atomic-component-error>
        );
      }

      return render && render.call(this);
    };
  };
}
