import {expect, test} from './fixture';

test.describe('atomic-commerce-text', () => {
  test('should show text', async ({text}) => {
    await text.load();

    await expect(text.getText).toHaveText('Atomic Commerce Text');
  });

  test('should translate text', async ({text}) => {
    await text.load({story: 'with-translations'});

    await text.hydrated.waitFor();

    await expect(text.getText).toHaveText('A single product');
  });

  test('should translate text with count', async ({text}) => {
    await text.load({
      args: {count: 2, value: 'translation-key'},
      story: 'with-translations',
    });

    await text.hydrated.waitFor();

    await expect(text.getText).toHaveText('2 products');
  });
});
