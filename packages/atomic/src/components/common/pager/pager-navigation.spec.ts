import i18next, {type i18n as I18n} from 'i18next';
import {html} from 'lit';
import {beforeEach, describe, expect, it} from 'vitest';
import enTranslations from '@/dist/atomic/lang/en.json';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderPagerNavigation} from './pager-navigation';

describe('#renderPagerNavigation', () => {
  let element: HTMLElement;
  let i18n: I18n;

  beforeEach(async () => {
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

  it('should render a <nav>', () => {
    expect(element.querySelector('nav')).toBeInTheDocument();
  });

  it('should set the aria-label using the translated pagination text on the <nav>', () => {
    expect(element.querySelector('nav')).toHaveAttribute('aria-label');
    expect(element.querySelector('nav')?.getAttribute('aria-label')).toBe(
      'Pagination'
    );
  });

  it('should render a <div> inside the <nav>', () => {
    expect(
      element.querySelector('nav')?.querySelector('div')
    ).toBeInTheDocument();
  });

  it('should set the "buttons" part on the <div>', () => {
    expect(element.querySelector('nav')?.querySelector('div')).toHaveAttribute(
      'part',
      'buttons'
    );
  });

  it('should set the "toolbar" role on the <div>', () => {
    expect(element.querySelector('nav')?.querySelector('div')).toHaveAttribute(
      'role',
      'toolbar'
    );
  });

  it('should contain the children', () => {
    expect(
      element.querySelector('nav')?.querySelector('div')
    ).toHaveTextContent('children');
  });
});
