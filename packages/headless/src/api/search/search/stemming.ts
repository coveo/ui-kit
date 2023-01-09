/**
 * Terms to highlight (with [stemming](https://docs.coveo.com/en/1576)) in the results.
 *
 * E.g., for the query "indexing consultant", where a result contains "Techzample is a consulting firm specializing in search indexes. It employs consultants that can analyze and improve your search index.", the `TermsToHighlight` might be `{ "indexing": ["indexes", "index"], "consultant": ["consulting", "consultants"] }`.
 */
export type TermsToHighlight = {[originalTerm: string]: string[]};
