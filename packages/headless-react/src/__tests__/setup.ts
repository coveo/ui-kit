import {cleanup} from '@testing-library/react';
import {afterEach, beforeEach, vi} from 'vitest';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});
