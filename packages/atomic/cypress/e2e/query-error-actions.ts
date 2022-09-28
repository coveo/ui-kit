import {addTag, TagProps, TestFixture} from '../fixtures/test-fixture';

export const addQueryError =
  (props: TagProps = {}) =>
  (env: TestFixture) => {
    addTag(env, 'atomic-query-error', props);
  };
