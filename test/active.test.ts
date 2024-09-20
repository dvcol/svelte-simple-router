import { describe, it } from 'vitest';

describe('active', () => {
  it.todo('should warn if the router is not found');
  it.todo('should warn if no path or name is found');

  it.todo('should set the data-active attribute if the path matches');
  it.todo('should remove the data-active attribute if the path does not match');

  it.todo('should set the options class if the path matches');
  it.todo('should remove the options class if the path does not match');

  it.todo('should set the options style if the path matches');
  it.todo('should remove the options style and restore the original style if the path does not match');

  it.todo('should only match the exact path when the exact option is true');
  it.todo('should match the path case insensitively when the caseSensitive option is false');
});
