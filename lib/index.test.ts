import { describe, it, expect } from 'vitest';

import { LIB_CONTENT } from './index';

describe('lib/index.ts', () => {
  it('should have LIB_CONTENT', () => {
    expect.assertions(1);
    expect(LIB_CONTENT).toBe('typescript-lib-template');
  });
});
