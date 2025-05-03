import { vi } from 'vitest';

export const LifeCycle: Record<string, { onMounted: () => unknown; onDestroyed: () => unknown }> = {
  Hello: { onMounted: vi.fn().mockImplementation(() => console.info('Mounted Hello Component !')), onDestroyed: vi.fn().mockImplementation(() => console.info('Destroyed Hello Component !')) },
  Goodbye: { onMounted: vi.fn().mockImplementation(() => console.info('Mounted Goodbye Component !')), onDestroyed: vi.fn().mockImplementation(() => console.info('Destroyed Goodbye Component !')) },
  Error: { onMounted: vi.fn().mockImplementation(() => console.info('Mounted Error Component !')), onDestroyed: vi.fn().mockImplementation(() => console.info('Destroyed Error Component !')) },
};
