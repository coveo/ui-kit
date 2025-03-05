export const injectStylesForNoShadowDOM =
  (styles: string) =>
  <
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends {new (...args: any[]): Partial<any>},
  >(
    Base: T
  ) => {
    return class extends Base {
      createRenderRoot() {
        return this;
      }

      connectedCallback() {
        super.connectedCallback();
        this.injectStyles();
      }

      injectStyles() {
        const styleId = this.localName;
        const root: Node = this.getRootNode && this.getRootNode();
        const parent = root instanceof ShadowRoot ? root : document.head;

        if (!parent.querySelector(`#${styleId}`)) {
          const style = document.createElement('style');
          style.id = styleId;
          style.textContent = styles;
          parent.appendChild(style);
        }
      }
    };
  };
