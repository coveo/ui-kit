import enTranslations from '@/dist/atomic/lang/en.json';
import i18next, {i18n as I18n} from 'i18next';
import {html, render} from 'lit';
import {describe, test, beforeAll, expect} from 'vitest';
import {pagerNavigation} from './pager-navigation';

describe('pagerNavigation', () => {
  let container: HTMLElement;
  let i18n: I18n;

  beforeAll(async () => {
    i18n = i18next.createInstance();
    await i18n.init({
      lng: 'en',
      resources: {
        en: {
          translation: enTranslations,
        },
      },
    });
    container = document.createElement('div');
    document.body.appendChild(container);

    render(
      html`${pagerNavigation({props: {i18n}, children: html`children`})}`,
      container
    );
  });

  test('should render a <nav>', () => {
    expect(container.querySelector('nav')).toBeInTheDocument();
  });

  test('should set the aria-label using the translated pagination text on the <nav>', () => {
    expect(container.querySelector('nav')).toHaveAttribute('aria-label');
    expect(container.querySelector('nav')?.getAttribute('aria-label')).toBe(
      'Pagination'
    );
  });

  test('<nav> should contain a <div>', () => {
    expect(
      container.querySelector('nav')?.querySelector('div')
    ).toBeInTheDocument();
  });

  test('should set the "buttons" part on the <div>', () => {
    expect(
      container.querySelector('nav')?.querySelector('div')
    ).toHaveAttribute('part', 'buttons');
  });

  test('should set the "toolbar" role on the <div>', () => {
    expect(
      container.querySelector('nav')?.querySelector('div')
    ).toHaveAttribute('role', 'toolbar');
  });

  test('should contain the children', () => {
    expect(
      container.querySelector('nav')?.querySelector('div')
    ).toHaveTextContent('children');
  });
});
