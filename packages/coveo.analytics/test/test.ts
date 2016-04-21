/// <reference path="../typings/main/ambient/isomorphic-fetch/index.d.ts" />

import test from 'ava';

async function fn() {
    return Promise.resolve('foo');
}

test('ava', async (t) => {
    t.is(await fn(), 'foo');
});
