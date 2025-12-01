import type {InteractiveProduct} from '@coveo/headless/commerce';
import {vi} from 'vitest';

export const buildFakeInteractiveProduct = (
  interactiveProduct?: Partial<InteractiveProduct>
): InteractiveProduct =>
  ({
    select: vi.fn(),
    beginDelayedSelect: vi.fn(),
    cancelPendingSelect: vi.fn(),
    warningMessage: undefined,
    ...interactiveProduct,
  }) satisfies InteractiveProduct;
