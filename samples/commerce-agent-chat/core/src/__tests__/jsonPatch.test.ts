import {describe, expect, it} from 'vitest';

import {applyPatchToActivity} from '../lib/activityState.js';
import {applyJsonPatch} from '../lib/jsonPatch.js';

describe('applyJsonPatch', () => {
  it('applies replace and nested add operations', () => {
    const source = {
      user: {
        profile: {name: 'Alice'},
      },
    };

    const result = applyJsonPatch(source, [
      {op: 'replace', path: '/user/profile/name', value: 'Bob'},
      {op: 'add', path: '/user/profile/age', value: 42},
    ]);

    expect(result).toEqual({
      user: {
        profile: {name: 'Bob', age: 42},
      },
    });
  });

  it('removes top-level properties', () => {
    const result = applyJsonPatch({a: 1, b: 2}, [{op: 'remove', path: '/a'}]);

    expect(result).toEqual({b: 2});
  });
});

describe('applyPatchToActivity', () => {
  it('updates only matching activity by id', () => {
    const activities = [
      {
        id: '1',
        activityType: 'surface',
        content: {title: 'old'},
      },
      {
        id: '2',
        activityType: 'surface',
        content: {title: 'unchanged'},
      },
    ];

    const result = applyPatchToActivity(activities, '1', [
      {op: 'replace', path: '/title', value: 'new'},
    ]);

    expect(result).toEqual([
      {
        id: '1',
        activityType: 'surface',
        content: {title: 'new'},
      },
      {
        id: '2',
        activityType: 'surface',
        content: {title: 'unchanged'},
      },
    ]);
  });
});
