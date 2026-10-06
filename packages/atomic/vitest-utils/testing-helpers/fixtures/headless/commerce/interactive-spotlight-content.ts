import type {InteractiveSpotlightContent} from '@coveo/headless/commerce';
import {vi} from 'vitest';

export const buildFakeInteractiveSpotlightContent = (
  interactiveSpotlightContent?: Partial<InteractiveSpotlightContent>
): InteractiveSpotlightContent =>
  ({
    select: vi.fn(),
    beginDelayedSelect: vi.fn(),
    cancelPendingSelect: vi.fn(),
    warningMessage: undefined,
    ...interactiveSpotlightContent,
  }) satisfies InteractiveSpotlightContent;
