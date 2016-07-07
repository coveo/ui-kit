import test from 'ava';
import { assign, ponyfill } from '../src/objectassign';

test('native: null target should throw', t => {
    t.throws(() => assign(undefined, {}), /null/ );
});

test('native: nested properties should be erased', t => {
    const srcs = [{'1': 2}, {'1': 3}];
    const result = assign({}, srcs[0], srcs[1]);

    t.deepEqual(result, {'1': 3});
});

test('native: multiple object copy', t => {
    const srcs = [{'1': 2}, {'1': {'2': 3}, '2': 3}, {'3': 4}];
    const result = assign({}, srcs[0], srcs[1], srcs[2]);

    t.deepEqual(result, {'1': {'2': 3}, '2': 3, '3': 4});
});

test('ponyfill: null target should throw', t => {
    t.throws(() => ponyfill(undefined, {}), /null/ );
});

test('ponyfill: nested properties should be erased', t => {
    const srcs = [{'1': 2}, {'1': 3}];
    const result = ponyfill({}, srcs[0], srcs[1]);

    t.deepEqual(result, {'1': 3});
});

test('ponyfill: multiple object copy', t => {
    const srcs = [{'1': 2}, {'1': {'2': 3}, '2': 3}, {'3': 4}];
    const result = ponyfill({}, srcs[0], srcs[1], srcs[2]);

    t.deepEqual(result, {'1': {'2': 3}, '2': 3, '3': 4});
});
