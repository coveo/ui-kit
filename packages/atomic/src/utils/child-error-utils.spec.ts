import {LitElement} from 'lit';
import {afterEach, describe, expect, it} from 'vitest';
import {displayChildErrors} from './child-error-utils';

class TestChild extends LitElement {
  static properties = {error: {state: true}};
  declare error?: Error;
}
customElements.define('test-child-error', TestChild);

describe('#displayChildErrors', () => {
  const children: TestChild[] = [];

  const appendChild = async () => {
    const child = document.createElement('test-child-error') as TestChild;
    document.body.append(child);
    children.push(child);
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
    children.splice(0).forEach((child) => child.remove());
  });

  it('should display the error of the first invalid child, with that error as cause', async () => {
    const parent: {error?: Error} = {};
    const [valid, invalid] = [await appendChild(), await appendChild()];
    const childError = new Error('invalid');
    invalid.error = childError;

    displayChildErrors(parent, [valid, invalid], 'test-child-error');

    expect(parent.error).toEqual(displayed(childError));
  });

  it('should clear the error it set once the child becomes valid', async () => {
    const parent: {error?: Error} = {};
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
    const parent: {error?: Error} = {error: otherError};
    const child = await appendChild();
    displayChildErrors(parent, [child], 'test-child-error');

    await setChildError(child, new Error('invalid'));
    expect(parent.error).toBe(otherError);

    await setChildError(child, undefined);
    expect(parent.error).toBe(otherError);
  });

  it('should display the child error again after another writer replaced and cleared it', async () => {
    const parent: {error?: Error} = {};
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
});
