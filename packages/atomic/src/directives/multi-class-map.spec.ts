import {html, render} from 'lit';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {multiClassMap, tw} from './multi-class-map';

describe('MultiClassMapDirective', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('renders a single class correctly', () => {
    const classMapInput = {foo: true};
    render(
      html`<div class="${multiClassMap(classMapInput)}"></div>`,
      container
    );

    const div = container.querySelector('div');
    expect(div).toHaveClass('foo');
  });

  it('renders multiple classes correctly', () => {
    const classMapInput = {'foo bar': true};
    render(
      html`<div class="${multiClassMap(classMapInput)}"></div>`,
      container
    );

    const div = container.querySelector('div');
    expect(div).toHaveClass('foo', 'bar');
  });

  it('ignores classes with a `false` value', () => {
    const classMapInput = {foo: true, 'bar baz': false};
    render(
      html`<div class="${multiClassMap(classMapInput)}"></div>`,
      container
    );

    const div = container.querySelector('div');
    expect(div).not.toHaveClass('bar', 'baz');
  });

  it('splits and processes space-separated class names', () => {
    const classMapInput = {'foo bar baz': true};
    render(
      html`<div class="${multiClassMap(classMapInput)}"></div>`,
      container
    );

    const div = container.querySelector('div');
    expect(div).toHaveClass('foo', 'bar', 'baz');
  });

  it('merges multiple class names correctly', () => {
    const classMapInput = {foo: true, 'bar baz': true};
    render(
      html`<div class="${multiClassMap(classMapInput)}"></div>`,
      container
    );

    const div = container.querySelector('div');
    expect(div).toHaveClass('foo', 'bar', 'baz');
  });

  it('renders no classes when all values are `false`', () => {
    const classMapInput = {foo: false, bar: false};
    render(
      html`<div class="${multiClassMap(classMapInput)}"></div>`,
      container
    );

    const div = container.querySelector('div');
    expect(div?.className.trim()).toBe('');
  });

  it('renders dynamic classes', () => {
    const otherClasses = 'other-class another-class';
    const classMapInput = tw({foo: true, [otherClasses || '']: true});

    render(
      html`<div class="${multiClassMap(classMapInput)}"></div>`,
      container
    );

    const div = container.querySelector('div');
    expect(div).toHaveClass('other-class', 'another-class', 'foo');
  });
});
