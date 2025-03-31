import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {vi} from 'vitest';
import {ChildrenUpdateCompleteMixin} from './children-update-complete-mixin';

type StencilTestElement = HTMLElement & {
  initialize: () => Promise<void>;
  componentOnReady: () => Promise<void>;
  value: string;
};

@customElement('test-children-update-complete')
class TestChildrenUpdateComplete extends ChildrenUpdateCompleteMixin(
  LitElement
) {
  isChildrenLoaded = false;
  waitForUpdateComplete = true;

  render() {
    return html`<slot></slot>`;
  }

  public async getPublicUpdateComplete() {
    return this.getUpdateComplete();
  }

  public async initialize() {
    const children = this.querySelectorAll(
      'child-lit-element, stencil-component'
    );
    children.forEach((child) => {
      (child as ChildLitElement | StencilTestElement).initialize();
    });
    if (this.waitForUpdateComplete) {
      await this.updateComplete;
    }
    this.checkDependent();
  }

  private checkDependent() {
    const children = Array.from(
      this.querySelectorAll('child-lit-element, stencil-component')
    ) as (ChildLitElement | StencilTestElement)[];

    this.isChildrenLoaded = children.every((child) => child.value === 'ready');
  }
}

@customElement('child-lit-element')
class ChildLitElement extends LitElement {
  @property({type: String})
  public value!: string;

  public async initialize() {
    await this.updateComplete;
    this.value = 'ready';
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  render() {
    return html`<slot></slot>`;
  }
}

describe('ChildrenUpdateCompleteMixin', () => {
  let element: TestChildrenUpdateComplete;

  const setupElement = async () => {
    element = document.createElement(
      'test-children-update-complete'
    ) as TestChildrenUpdateComplete;
    document.body.appendChild(element);

    await element.updateComplete;
  };

  const setupChildLitElement = async (parentElement: LitElement) => {
    const child = document.createElement(
      'child-lit-element'
    ) as ChildLitElement;
    parentElement.appendChild(child);
  };

  const setupStencilElement = async (parentElement: LitElement) => {
    const stencilElement = document.createElement(
      'stencil-component'
    ) as StencilTestElement & {
      componentOnReady: () => Promise<void>;
      value: string;
    };

    stencilElement.initialize = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      stencilElement.value = 'ready';
    });
    stencilElement.componentOnReady = vi.fn(async () => {
      while (!stencilElement.value) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    });
    parentElement.appendChild(stencilElement);
  };

  const setupNestedChildLitElements = async (parentElement: LitElement) => {
    const child1 = document.createElement(
      'child-lit-element'
    ) as ChildLitElement;
    const child2 = document.createElement(
      'child-lit-element'
    ) as ChildLitElement;
    const nestedChild = document.createElement(
      'child-lit-element'
    ) as ChildLitElement;

    child1.appendChild(nestedChild);
    parentElement.appendChild(child1);
    parentElement.appendChild(child2);
  };

  const teardownElement = () => {
    if (document.body.contains(element)) {
      document.body.removeChild(element);
    }
  };

  beforeEach(async () => {
    await setupElement();
  });

  afterEach(() => {
    teardownElement();
  });

  it('should wait for child LitElement updates to complete', async () => {
    setupChildLitElement(element);
    await element.initialize();

    expect(element.isChildrenLoaded).toBe(true);
  });

  it('should wait for Stencil components to be ready', async () => {
    setupStencilElement(element);
    await element.initialize();

    expect(element.isChildrenLoaded).toBe(true);
  });

  it('should fail if not waiting for updateComplete', async () => {
    setupChildLitElement(element);
    element.waitForUpdateComplete = false;
    await element.initialize();

    expect(element.isChildrenLoaded).toBe(false);
  });

  it('should return base updateComplete when no children are present', async () => {
    const baseUpdateComplete = await element.getPublicUpdateComplete();
    expect(baseUpdateComplete).toBe(true);
  });

  it('should wait for multiple LitElement children recursively', async () => {
    await setupNestedChildLitElements(element);
    await element.initialize();

    expect(element.isChildrenLoaded).toBe(true);
  });

  it('should wait for all children to be ready before resolving updateComplete', async () => {
    const child1 = document.createElement(
      'child-lit-element'
    ) as ChildLitElement;
    const child2 = document.createElement(
      'child-lit-element'
    ) as ChildLitElement;

    const child1UpdateCompleteSpy = vi.spyOn(child1, 'updateComplete', 'get');
    const child2UpdateCompleteSpy = vi.spyOn(child2, 'updateComplete', 'get');
    child1UpdateCompleteSpy.mockReturnValue(Promise.resolve(true));
    child2UpdateCompleteSpy.mockReturnValue(Promise.resolve(true));

    element.appendChild(child1);
    child1.appendChild(child2);

    await element.getPublicUpdateComplete();

    expect(child1UpdateCompleteSpy).toHaveBeenCalled();
    expect(child2UpdateCompleteSpy).toHaveBeenCalled();
  });
});
