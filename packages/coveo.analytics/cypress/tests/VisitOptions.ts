export const getQueryParameters = () => {
    return {
        version: getVersion(),
        endpoint: getEndpoint(),
        token: getToken(),
    };
};

const getToken = () => (Cypress.env('token') as string) || 'invalid';
const getVersion = () => (Cypress.env('version') as string) || '2';
const getEndpoint = () => (Cypress.env('endpoint') as string) || 'https://platform.cloud.coveo.com/rest/ua';

export const getCollectEndpoint = () => `${getEndpoint()}/v15/analytics/collect`;
