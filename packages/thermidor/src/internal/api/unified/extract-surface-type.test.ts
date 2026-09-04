import {describe, expect, it} from 'vitest';
import {extractSurfaceType} from './unified-runtime.js';

describe('extractSurfaceType', () => {
  it('returns surfaceType from a valid payload', () => {
    const content = {
      messages: [{createSurface: {surfaceType: 'commerceSearch', surfaceId: 'abc'}}],
    };

    expect(extractSurfaceType(content)).toBe('commerceSearch');
  });

  it('returns undefined when surfaceType is absent from createSurface', () => {
    const content = {
      messages: [{createSurface: {surfaceId: 'abc'}}],
    };

    expect(extractSurfaceType(content)).toBeUndefined();
  });

  it('returns undefined when messages is an empty array', () => {
    const content = {messages: []};

    expect(extractSurfaceType(content)).toBeUndefined();
  });

  it('returns undefined when messages is null', () => {
    const content = {messages: null};

    expect(extractSurfaceType(content as any)).toBeUndefined();
  });

  it('returns undefined when messages is undefined', () => {
    const content = {messages: undefined};

    expect(extractSurfaceType(content as any)).toBeUndefined();
  });

  it('returns undefined when messages is a non-array object', () => {
    const content = {messages: {0: {createSurface: {surfaceType: 'commerceSearch'}}}};

    expect(extractSurfaceType(content as any)).toBeUndefined();
  });

  it('returns undefined when messages contains non-object entries', () => {
    const content = {messages: ['string', 42, null, true]};

    expect(extractSurfaceType(content as any)).toBeUndefined();
  });

  it('returns undefined when surfaceType is a number', () => {
    const content = {
      messages: [{createSurface: {surfaceType: 123}}],
    };

    expect(extractSurfaceType(content as any)).toBeUndefined();
  });

  it('returns undefined when surfaceType is null', () => {
    const content = {
      messages: [{createSurface: {surfaceType: null}}],
    };

    expect(extractSurfaceType(content as any)).toBeUndefined();
  });

  it('finds createSurface when it is not the first message', () => {
    const content = {
      messages: [
        {someOtherOperation: {}},
        {anotherMessage: {data: 'test'}},
        {createSurface: {surfaceType: 'converse', surfaceId: 'xyz'}},
      ],
    };

    expect(extractSurfaceType(content)).toBe('converse');
  });

  it('returns undefined when createSurface value is not an object', () => {
    const content = {
      messages: [{createSurface: 'not-an-object'}],
    };

    expect(extractSurfaceType(content as any)).toBeUndefined();
  });

  it('returns undefined when content has no messages field', () => {
    const content = {operations: [{createSurface: {surfaceType: 'commerceSearch'}}]};

    expect(extractSurfaceType(content)).toBeUndefined();
  });
});
