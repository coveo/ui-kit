// eslint-disable-next-line node/no-unpublished-import
import {graphql} from '@octokit/graphql';

export interface DiscussionCategories {
  edges: Array<{
    node: {
      name: string;
      id: string;
    };
  }>;
}

export interface RepoCategoryData {
  id: string;
  discussionCategories: DiscussionCategories;
}

export interface RepoCategoryResponse {
  repository: RepoCategoryData;
}

export async function getRepoCategoryData(
  repoOwner: string,
  repoName: string,
  token: string
): Promise<RepoCategoryData> {
  const maxCategories = 10;
  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `token ${token}`,
    },
  });
  const query = `
    query {
      repository(owner: "${repoOwner}", name: "${repoName}") {
        id
        discussionCategories(first: ${maxCategories}) {
          edges {
            node {
              name
              id
            }
          }
        }
      }
    }
  `;
  return ((await graphqlWithAuth(query)) as RepoCategoryResponse).repository;
}

export interface CreateDiscussionResponse {
  createDiscussion: CreateDiscussionData;
}

export interface CreateDiscussionData {
  discussion: {
    id: string;
  };
}

export async function createDiscussion(
  repoId: string,
  categoryId: string,
  title: string,
  body: string,
  token: string
): Promise<CreateDiscussionData> {
  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `token ${token}`,
    },
  });
  const query = `
    mutation {
      createDiscussion(input: {repositoryId: "${repoId}", categoryId: "${categoryId}", body: "${body}", title: "${title}"}) {
        discussion {
          id
        }
      }
    }
  `;
  return ((await graphqlWithAuth(query)) as CreateDiscussionResponse)
    .createDiscussion;
}
