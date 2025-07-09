import i18next, {type i18n as I18n} from 'i18next';
import {html, render} from 'lit';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {type LocalizedStringProps, localizedString} from './localized-string';

describe('localizedString', () => {
  let container: HTMLElement;
  let i18n: I18n;

  beforeEach(() => {
    i18n = i18next.createInstance();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should render a localized string with placeholders', async () => {
    await i18n.init({
      lng: 'en',
      resources: {
        en: {
          translation: {
            'test.key': 'Hello, {{name}}!',
          },
        },
      },
    });

    const props: LocalizedStringProps = {
      i18n,
      key: 'test.key',
      params: {name: 'World'},
    };

    render(html`<div>${localizedString(props)}</div>`, container);

    expect(container.textContent).toContain('Hello, World!');
  });

  it('should render a localized string with multiple placeholders', async () => {
    await i18n.init({
      lng: 'en',
      resources: {
        en: {
          translation: {
            'test.key': 'Hello, {{name}}! You have {{count}} messages.',
          },
        },
      },
    });

    const props: LocalizedStringProps = {
      i18n,
      key: 'test.key',
      params: {name: 'World', count: '5'},
    };

    render(html`<div>${localizedString(props)}</div>`, container);

    expect(container.textContent).toContain(
      'Hello, World! You have 5 messages.'
    );
  });

  it('should render a localized string with HTML template parameters', async () => {
    await i18n.init({
      lng: 'en',
      resources: {
        en: {
          translation: {
            'test.key': 'Hello, {{name}}! Here is a link: {{link}}.',
          },
        },
      },
    });

    const props: LocalizedStringProps = {
      i18n,
      key: 'test.key',
      params: {
        name: 'World',
        link: html`<a href="https://example.com">example</a>`,
      },
    };

    render(html`<div>${localizedString(props)}</div>`, container);

    expect(container.textContent).toContain(
      'Hello, World! Here is a link: example'
    );
    const link = container.querySelector('a');
    expect(link).toBeTruthy();
    expect(link?.getAttribute('href')).toBe('https://example.com');
    expect(link?.textContent).toBe('example');
  });

  it('should throw an error if used in an unsupported part type', () => {
    const props: LocalizedStringProps = {
      i18n,
      key: 'test.key',
      params: {name: 'World'},
    };

    expect(() => {
      render(html`<div .prop=${localizedString(props)}></div>`, container);
    }).toThrow('localizedString can only be used in child bindings');
  });
});
