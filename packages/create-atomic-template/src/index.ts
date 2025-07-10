import {waitForAtomic} from './utils/atomic';

async function main() {
  await waitForAtomic();
  const searchInterface: HTMLAtomicSearchInterfaceElement =
    document.querySelector('atomic-search-interface')!;

  const organizationId = process.env.ORGANIZATION_ID!;
  const platformEnvironment = process.env.PLATFORM_ENVIRONMENT || 'prod';
  const accessToken = process.env.API_KEY!;
  await searchInterface.initialize({
    accessToken,
    organizationId,
    environment: platformEnvironment as 'dev' | 'stg' | 'prod' | 'hipaa',
  });

  searchInterface.executeFirstSearch();
}

main();
