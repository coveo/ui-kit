const page = require('../page-objects/full-search');

describe('example-search', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3333/preview/c/exampleSearch');
    });

    it('should load example page', async () => {
        await page.waitForLoad();
    });

    it('should update results when clicking a facet', async () => {
        await page.waitForLoad();

        const summaryBeforeFacetClick = await page.getSummaryText();

        // Select a facet value
        cy.xpath('//c-quantic-facet-value[1]/li/div[1]/input').first().trigger('change', { value: true });
        cy.wait(1000);

        const summaryAfterFacetClick = await page.getSummaryText();

        expect(summaryAfterFacetClick).not.to.eq(summaryBeforeFacetClick);
    });

    it('should update results when changing keywords in the searchbox', async () => {
        await page.waitForLoad();

        const summaryBeforeSearch = await page.getSummaryText();

        await page.search();

        const summaryAfterSearch = await page.getSummaryText();

        expect(summaryAfterSearch).not.to.eq(summaryBeforeSearch);
    });
});
