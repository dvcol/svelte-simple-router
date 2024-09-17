export const toPathSegment = (str?: string, trailing = false): string => {
  let _str = str?.trim();
  if (!_str?.length) return '';
  if (!_str.startsWith('/')) _str = `/${_str}`;
  if (trailing && !_str.endsWith('/')) _str = `${_str}/`;
  if (!trailing && _str.endsWith('/')) _str = _str.slice(0, -1);
  return _str;
};
