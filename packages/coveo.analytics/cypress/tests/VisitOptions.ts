export const getQueryParameters = () => {
    return {
        version: getVersion(),
        endpoint: getEndpoint(),
        token: getToken(),
        targetEnv: getTargetEnv(),
    };
};

const getToken = () => (Cypress.env('token') as string) || 'invalid';
const getVersion = () => (Cypress.env('version') as string) || '2';
const getEndpoint = () => (Cypress.env('endpoint') as string) || 'https://platform.cloud.coveo.com/rest/ua';
const getTargetEnv = () => (Cypress.env('targetEnv') as string) || 'prd';

export const getCollectEndpoint = () => `${getEndpoint()}/v15/analytics/collect`;
