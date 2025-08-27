import {cleanup} from '@testing-library/react';
import {afterEach, beforeEach} from 'vitest';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});
