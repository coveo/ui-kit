const waitForLoad = async () => {
    return cy.xpath('//c-quantic-result').should('exist');
};

const search = async () => {
    // Searching for "test" + enter (codes: 84, 69, 83, 84 + 13)
    cy.xpath('//c-quantic-search-box')
        .xpath('.//input')
        .invoke('val', 'test')
        .trigger('keyup', { which: 84 })
        .trigger('keyup', { which: 69 })
        .trigger('keyup', { which: 83 })
        .trigger('keyup', { which: 84 })
        .trigger('keyup', { which: 13 });
    cy.wait(1000);
};

const getSummaryText = async () => {
    return new Promise((resolve) => {
        cy.xpath('//c-quantic-summary/p')
            .invoke('text')
            .then(summaryText => resolve(summaryText));
    });
};

module.exports = {
    waitForLoad: waitForLoad,
    search: search,
    getSummaryText: getSummaryText,
};
