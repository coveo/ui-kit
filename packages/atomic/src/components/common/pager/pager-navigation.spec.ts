import i18next, {type i18n as I18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, test} from 'vitest';
import enTranslations from '@/dist/atomic/lang/en.json';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderPagerNavigation} from './pager-navigation';

describe('pagerNavigation', () => {
  let element: HTMLElement;
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

    element = await renderFunctionFixture(
      html`${renderPagerNavigation({props: {i18n}})(html`children`)}`
    );
  });

  test('should render a <nav>', () => {
    expect(element.querySelector('nav')).toBeInTheDocument();
  });

  test('should set the aria-label using the translated pagination text on the <nav>', () => {
    expect(element.querySelector('nav')).toHaveAttribute('aria-label');
    expect(element.querySelector('nav')?.getAttribute('aria-label')).toBe(
      'Pagination'
    );
  });

  test('<nav> should contain a <div>', () => {
    expect(
      element.querySelector('nav')?.querySelector('div')
    ).toBeInTheDocument();
  });

  test('should set the "buttons" part on the <div>', () => {
    expect(element.querySelector('nav')?.querySelector('div')).toHaveAttribute(
      'part',
      'buttons'
    );
  });

  test('should set the "toolbar" role on the <div>', () => {
    expect(element.querySelector('nav')?.querySelector('div')).toHaveAttribute(
      'role',
      'toolbar'
    );
  });

  test('should contain the children', () => {
    expect(
      element.querySelector('nav')?.querySelector('div')
    ).toHaveTextContent('children');
  });
});
