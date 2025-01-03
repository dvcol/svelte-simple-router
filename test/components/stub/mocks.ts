import { vi } from 'vitest';

export const LifeCycle: Record<string, { onMounted: () => unknown; onDestroyed: () => unknown }> = {
  Hello: { onMounted: vi.fn(), onDestroyed: vi.fn() },
  Goodbye: { onMounted: vi.fn(), onDestroyed: vi.fn() },
  Error: { onMounted: vi.fn(), onDestroyed: vi.fn() },
};
