import {describe, it, expect} from 'vitest';
import {buildRequest} from './endpoint-facade-request-builder.js';
import type {RequestContributor} from './endpoint-facade-types.js';

interface TestRequest {
  q?: string;
  numberOfResults?: number;
  fieldsToInclude?: string[];
  context?: {
    user?: {
      userAgent?: string;
    };
    cart?: {
      items?: string[];
    };
  };
}

describe('buildRequest', () => {
  it('should return an empty request when no contributors are registered', () => {
    const request = buildRequest<TestRequest>([]);

    expect(request).toEqual({});
  });

  it('should execute contributors in registration order', () => {
    const executionOrder: string[] = [];
    const contributors: Array<RequestContributor<TestRequest>> = [
      () => {
        executionOrder.push('search-box');
        return {q: 'headless'};
      },
      () => {
        executionOrder.push('pagination');
        return {numberOfResults: 25};
      },
    ];

    const request = buildRequest(contributors);

    expect(executionOrder).toEqual(['search-box', 'pagination']);
    expect(request).toEqual({q: 'headless', numberOfResults: 25});
  });

  it('should allow later contributors to override previously written fields', () => {
    const contributors: Array<RequestContributor<TestRequest>> = [
      () => ({q: 'first'}),
      () => ({q: 'second'}),
    ];

    expect(buildRequest(contributors)).toEqual({q: 'second'});
  });

  it('should treat arrays as plain values when merging', () => {
    const contributors: Array<RequestContributor<TestRequest>> = [
      () => ({fieldsToInclude: ['title']}),
      () => ({fieldsToInclude: ['uri']}),
    ];

    expect(buildRequest(contributors)).toEqual({fieldsToInclude: ['uri']});
  });

  it('should deep merge nested plain objects', () => {
    const contributors: Array<RequestContributor<TestRequest>> = [
      () => ({context: {user: {userAgent: 'Mozilla/5.0'}}}),
      () => ({context: {cart: {items: ['sku-1']}}}),
    ];

    expect(buildRequest(contributors)).toEqual({
      context: {
        user: {userAgent: 'Mozilla/5.0'},
        cart: {items: ['sku-1']},
      },
    });
  });
});
