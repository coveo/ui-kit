import {configure} from '../../page-objects/configurator';
import {PlaceholderExpectations as Expect} from './placeholder-expectations';

interface PlaceholderOptions {
  variant: string;
  numberOfRows: number;
}

describe('quantic-placeholder', () => {
  const pageUrl = 's/quantic-placeholder';

  function visitPlaceholder(options: Partial<PlaceholderOptions>) {
    cy.visit(pageUrl);
    configure(options);
  }

  describe('without options', () => {
    it('should not display', () => {
      visitPlaceholder({});

      Expect.displayCardPlaceholder(false);
      Expect.displayCardRowPlaceholders(0);
      Expect.displayCardPlaceholder(false);
      Expect.displayCardRowPlaceholders(0);
    });
  });

  describe('with card variant', () => {
    const variant = 'card';
    const numberOptions = [0, 5, 10];

    numberOptions.forEach((number) => {
      it(`should display a card placeholder with ${number} rows`, () => {
        visitPlaceholder({variant, numberOfRows: number});

        Expect.displayCardPlaceholder(true);
        Expect.displayCardRowPlaceholders(number);
      });
    });
  });

  describe('with resultlist variant', () => {
    const variant = 'resultList';
    const numberOptions = [1, 5, 10];

    numberOptions.forEach((number) => {
      it(`should display a resuilt list placeholder with ${number} rows`, () => {
        visitPlaceholder({variant, numberOfRows: number});

        Expect.displayResultListPlaceholder(true);
        Expect.displayResultPlaceholders(number);
      });
    });
  });
});
