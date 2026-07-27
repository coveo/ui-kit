import {describe, it, expectTypeOf} from 'vitest';
import type {Supports} from './interface-types.js';
import type {SearchInterface} from '@/src/public/interfaces/search.js';
import type {CommerceInterface} from '@/src/public/interfaces/commerce.js';
import type {GenerativeInterface} from '@/src/public/interfaces/generative.js';
import type {ComposedInterface} from '@/src/public/interfaces/compose.js';
import type {composeInterfaces} from '@/src/public/interfaces/compose.js';

describe('Supports<F> type safety', () => {
  describe('BaseInterface', () => {
    it('accepts an interface that declares the facade', () => {
      expectTypeOf<SearchInterface>().toExtend<Supports<'search'>>();
    });

    it('rejects an interface that does not declare the facade', () => {
      expectTypeOf<GenerativeInterface>().not.toExtend<Supports<'search'>>();
    });
  });

  describe('ComposedInterface', () => {
    it('accepts a composed interface with one interface that has the facade', () => {
      expectTypeOf<ComposedInterface<'search'>>().toExtend<Supports<'search'>>();
    });

    it('accepts a composed interface with mixed types where at least one has the facade', () => {
      expectTypeOf<ComposedInterface<'search' | 'commerce'>>().toExtend<Supports<'search'>>();
    });

    it('rejects a composed interface where no interface has the facade', () => {
      expectTypeOf<ComposedInterface<'generative'>>().not.toExtend<Supports<'search'>>();
    });
  });
});

describe('composeInterfaces type inference', () => {
  it('infers ComposedInterface<"search"> from a single SearchInterface', () => {
    expectTypeOf<ReturnType<typeof composeInterfaces<SearchInterface>>>().toEqualTypeOf<
      ComposedInterface<'search'>
    >();
  });

  it('infers ComposedInterface<"search" | "commerce"> from mixed search/commerce', () => {
    expectTypeOf<
      ReturnType<typeof composeInterfaces<SearchInterface | CommerceInterface>>
    >().toEqualTypeOf<ComposedInterface<'search' | 'commerce'>>();
  });

  it('infers ComposedInterface<"search" | "generative"> from cross-type composition', () => {
    expectTypeOf<
      ReturnType<typeof composeInterfaces<SearchInterface | GenerativeInterface>>
    >().toEqualTypeOf<ComposedInterface<'search' | 'generative'>>();
  });

  it('cross-type composed is assignable to Supports for each constituent facade', () => {
    expectTypeOf<ComposedInterface<'search' | 'generative'>>().toExtend<Supports<'search'>>();
    expectTypeOf<ComposedInterface<'search' | 'generative'>>().toExtend<Supports<'conversation'>>();
  });

  it('cross-type composed is NOT assignable to Supports for unrelated facade', () => {
    expectTypeOf<ComposedInterface<'generative'>>().not.toExtend<Supports<'search'>>();
  });
});
