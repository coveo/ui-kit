/* eslint-disable node/no-unpublished-import */
import {graphql} from '@octokit/graphql';
import {
  Repository,
  Discussion,
  validate,
  CreateDiscussionInput,
  Mutation,
  QueryRepositoryArgs,
} from '@octokit/graphql-schema';

export async function getRepoCategoryData(
  args: QueryRepositoryArgs,
  token: string
): Promise<Repository> {
  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `token ${token}`,
    },
  });
  const query = `
    query categoryTypes($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
        id
        discussionCategories(first: 10) {
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
  validate(query);
  return (await graphqlWithAuth<{repository: Repository}>(query, args))
    .repository;
}

export async function createDiscussion(
  args: CreateDiscussionInput,
  token: string
): Promise<Discussion> {
  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `token ${token}`,
    },
  });
  const query = `
    mutation createDiscussion($repositoryId: String!, $categoryId: String!,  $title: String!, $body: String!) {
      createDiscussion(input: {repositoryId: $repositoryId, categoryId: $categoryId, title: $title, body: $body}) {
        discussion {
          id
        }
      }
    }
  `;

  validate(query);
  return (await graphqlWithAuth<Mutation>(query, args)).createDiscussion
    ?.discussion;
}
