import {describe, it, expect} from 'vitest';
import './atomic-result-example-component.js';

describe('atomic-result-example-component', () => {
  it('whatsMyName should return the name', () => {
    const component = document.createElement('atomic-result-example-component');
    component.name = 'World';
    document.body.appendChild(component);
    expect(component.whatsMyName()).toBe('World');
  });
});
