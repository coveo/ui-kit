import type {PlatformClient} from '@coveo/platform-client';

export async function listSearchPagesOptions(client: PlatformClient) {
  return (await client.searchInterfaces.list({perPage: 150})).items.map(
    (page) => ({
      value: page.id,
      name: page.name,
    })
  );
}
