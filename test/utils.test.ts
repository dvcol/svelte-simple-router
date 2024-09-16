import { describe, it } from 'vitest';

describe('routeToHistoryState', () => {
  it.todo('should return a history state object');
  it.todo('should return a history state object and title');
  it.todo('should return a history state object and title with meta');
  it.todo('should return a history state object and title without meta');
  it.todo('should return a history state object and title with name');
  it.todo('should return a history state object and store scroll position');
  it.todo('should return a history state object and seed state');
});

describe('computeAbsolutePath', () => {
  it.todo('should compute an absolute path from a relative path and a parent path');
  it.todo('should compute an absolute path from a relative path and a parent path with a multiple levels');
  it.todo('should throw an error if the parent path has insufficient levels');
});

describe('resolveNewHref', () => {
  it.todo('should resolve a new href in hash mode');
  it.todo('should resolve a new href in hash mode with a query');

  it.todo('should resolve a new href in path mode');
  it.todo('should resolve a new href in path mode with a query');
});

describe('guards', () => {
  describe('isRouteNavigation', () => {
    it.todo('should return true if the event is a name route navigation event');
    it.todo('should return true if the event is a location route navigation event');
    it.todo('should return false if the event is falsy');
    it.todo('should return false if the event is not an object');
    it.todo('should return false if the event is missing a name or path property');
  });

  describe('preventNavigation', () => {
    it.todo('should throw an error if the guard returns an error');
    it.todo('should return true if the guard returns false');
    it.todo('should return the navigation event if the guard returns a navigation event');
    it.todo('should return true if the guard returns true');
    it.todo('should return false if the guard returns undefined');
    it.todo('should return false if the guard returns null');
    it.todo('should return false if the guard returns a falsy value');
  });
});
