import {ComponentInterface, h} from '@stencil/core';

export function RenderError() {
  return (component: ComponentInterface, errorVariable: string) => {
    const {render} = component;
    if (!render) {
      console.error(
        'The "render" lifecycle method has to be defined for the RenderError decorator to work. It is recommended to use the decorator directly on "render'
      );
      return;
    }

    component.render = function () {
      if (this[errorVariable]) {
        return (
          <atomic-component-error
            error={this[errorVariable]}
          ></atomic-component-error>
        );
      }

      return render.call(this);
    };
  };
}
