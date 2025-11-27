import {test} from './fixture';

test.describe('atomic-result-html', () => {
  test('should render HTML content for title field', async ({resultHtml}) => {
    await resultHtml.load({args: {field: 'title'}});
    await resultHtml.hydrated.first().waitFor();

    const htmlElement = resultHtml.htmlElement;
    await htmlElement.waitFor({state: 'visible'});
  });
});
