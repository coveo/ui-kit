import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ChildrenUpdateCompleteMixin} from './children-update-complete-mixin';

type StencilTestElement = HTMLElement & {
  initialize: () => Promise<void>;
  componentOnReady: () => Promise<void>;
  value: string;
};

type ChildElement =
  | ChildLitElement
  | ChildLitElementNested
  | StencilTestElement;

const CHILDREN_SELECTOR =
  'child-lit-element, stencil-component, child-lit-element-nested';

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
  getAllChildren() {
    const collectChildren = (element: Element): ChildElement[] => {
      const children: ChildElement[] = [];
      const allChildren = [
        ...Array.from(element.querySelectorAll(CHILDREN_SELECTOR)),
        ...Array.from(
          element.shadowRoot?.querySelectorAll(CHILDREN_SELECTOR) || []
        ),
      ];

      allChildren.forEach((child) => {
        children.push(child as ChildElement);
        children.push(...collectChildren(child));
      });

      return children;
    };

    return collectChildren(this);
  }

  public async initialize() {
    const children = this.getAllChildren();
    children.forEach((child) => {
      child.initialize();
    });
    if (this.waitForUpdateComplete) {
      await this.updateComplete;
    }
    this.checkDependent();
  }

  private checkDependent() {
    const children = this.getAllChildren();
    this.isChildrenLoaded = children.every((child) => child.value === 'ready');
  }
}

@customElement('child-lit-element')
class ChildLitElement extends ChildrenUpdateCompleteMixin(LitElement) {
  @property({type: String})
  public value!: string;

  public async initialize() {
    await this.initializeNested();
    await this.updateComplete;
    this.value = 'ready';
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  private async initializeNested() {
    const nestedChild = document.createElement(
      'child-lit-element-nested'
    ) as ChildLitElementNested;
    this.appendChild(nestedChild);
    if (nestedChild) {
      (nestedChild as ChildLitElementNested).initialize();
    }
  }

  render() {
    return html`><slot></slot>`;
  }
}

@customElement('child-lit-element-nested')
class ChildLitElementNested extends LitElement {
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

  const setupInterfaceElement = async () => {
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

  const teardownElement = () => {
    if (document.body.contains(element)) {
      document.body.removeChild(element);
    }
  };

  beforeEach(async () => {
    await setupInterfaceElement();
  });

  afterEach(() => {
    teardownElement();
  });

  it('should wait for child LitElement updates to complete', async () => {
    await setupChildLitElement(element);
    await element.initialize();

    expect(element.isChildrenLoaded).toBe(true);
  });

  it('should wait for Stencil components to be ready', async () => {
    await setupStencilElement(element);
    await element.initialize();

    expect(element.isChildrenLoaded).toBe(true);
  });

  it('should fail if not waiting for updateComplete', async () => {
    await setupChildLitElement(element);
    element.waitForUpdateComplete = false;
    await element.initialize();

    expect(element.isChildrenLoaded).toBe(false);
  });

  it('should return base updateComplete when no children are present', async () => {
    const baseUpdateComplete = await element.getPublicUpdateComplete();
    expect(baseUpdateComplete).toBe(true);
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

  it('should not wait for updateComplete when child has an error', async () => {
    const childWithError = document.createElement(
      'child-lit-element'
    ) as ChildLitElement & {error: Error};
    const childWithoutError = document.createElement(
      'child-lit-element'
    ) as ChildLitElement;

    // Set an error on the first child
    childWithError.error = new Error('Test error');

    const childWithErrorUpdateCompleteSpy = vi.spyOn(
      childWithError,
      'updateComplete',
      'get'
    );
    const childWithoutErrorUpdateCompleteSpy = vi.spyOn(
      childWithoutError,
      'updateComplete',
      'get'
    );

    childWithErrorUpdateCompleteSpy.mockReturnValue(Promise.resolve(true));
    childWithoutErrorUpdateCompleteSpy.mockReturnValue(Promise.resolve(true));

    element.appendChild(childWithError);
    element.appendChild(childWithoutError);

    await element.getPublicUpdateComplete();

    // Should not wait for the child with error
    expect(childWithErrorUpdateCompleteSpy).not.toHaveBeenCalled();
    // Should still wait for the child without error
    expect(childWithoutErrorUpdateCompleteSpy).toHaveBeenCalled();
  });
});
