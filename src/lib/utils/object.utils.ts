export function shallowClone<T, O extends keyof T | string | number | symbol = keyof T | string | number | symbol>(
  obj: T,
  depth = 1,
  omit: O[] = [],
): T {
  if (!obj || depth === 0 || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => (omit.includes(item) ? item : shallowClone(item, depth - 1, omit))) as T;
  }

  return Object.keys(obj).reduce<T>((acc, key) => {
    if (!omit.includes(key as O)) {
      acc[key as keyof T] = shallowClone(obj[key as keyof T], depth - 1, omit);
    } else {
      acc[key as keyof T] = obj[key as keyof T];
    }
    return acc;
  }, {} as T);
}
