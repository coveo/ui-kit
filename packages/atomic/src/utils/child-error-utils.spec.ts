import {LitElement} from 'lit';
import {afterEach, describe, expect, it} from 'vitest';
import {displayChildErrors} from './child-error-utils';

class TestChild extends LitElement {
  static properties = {error: {state: true}};
  declare error?: Error;
}
customElements.define('test-child-error', TestChild);

class TestParent extends LitElement {
  static properties = {error: {state: true}};
  declare error?: Error;
}
customElements.define('test-parent-error', TestParent);

describe('#displayChildErrors', () => {
  const elements: LitElement[] = [];

  const appendParent = async (error?: Error) => {
    const parent = document.createElement('test-parent-error') as TestParent;
    parent.error = error;
    document.body.append(parent);
    elements.push(parent);
    await parent.updateComplete;
    return parent;
  };

  const appendChild = async () => {
    const child = document.createElement('test-child-error') as TestChild;
    document.body.append(child);
    elements.push(child);
    await child.updateComplete;
    return child;
  };

  const setChildError = async (child: TestChild, error?: Error) => {
    child.error = error;
    await child.updateComplete;
  };

  const displayed = (childError: Error) =>
    expect.objectContaining({
      message: `An "test-child-error" child is invalid: ${childError.message}`,
      cause: childError,
    });

  afterEach(() => {
    elements.splice(0).forEach((element) => element.remove());
  });

  it('should display the error of the first invalid child, with that error as cause', async () => {
    const parent = await appendParent();
    const [valid, invalid] = [await appendChild(), await appendChild()];
    const childError = new Error('invalid');
    invalid.error = childError;

    displayChildErrors(parent, [valid, invalid], 'test-child-error');

    expect(parent.error).toEqual(displayed(childError));
  });

  it('should clear the error it set once the child becomes valid', async () => {
    const parent = await appendParent();
    const child = await appendChild();
    displayChildErrors(parent, [child], 'test-child-error');

    const childError = new Error('invalid');
    await setChildError(child, childError);
    expect(parent.error).toEqual(displayed(childError));

    await setChildError(child, undefined);
    expect(parent.error).toBeUndefined();
  });

  it('should never replace or clear an error it did not set', async () => {
    const otherError = new Error('other');
    const parent = await appendParent(otherError);
    const child = await appendChild();
    displayChildErrors(parent, [child], 'test-child-error');

    await setChildError(child, new Error('invalid'));
    expect(parent.error).toBe(otherError);

    await setChildError(child, undefined);
    expect(parent.error).toBe(otherError);
  });

  it('should display the child error again after another writer replaced and cleared it', async () => {
    const parent = await appendParent();
    const child = await appendChild();
    const childError = new Error('invalid');
    displayChildErrors(parent, [child], 'test-child-error');
    await setChildError(child, childError);

    parent.error = new Error('other');
    parent.error = undefined;
    child.requestUpdate();
    await child.updateComplete;

    expect(parent.error).toEqual(displayed(childError));
  });

  it('should display a static child error again once another writer clears its own parent error', async () => {
    const parent = await appendParent();
    const child = await appendChild();
    const childError = new Error('invalid');
    await setChildError(child, childError);
    displayChildErrors(parent, [child], 'test-child-error');

    parent.error = new Error('other');
    await parent.updateComplete;
    parent.error = undefined;
    await parent.updateComplete;

    expect(parent.error).toEqual(displayed(childError));
  });
});
