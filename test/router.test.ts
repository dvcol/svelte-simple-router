import { describe, it } from 'vitest';

describe('router', () => {
  describe('addRoute', () => {
    it.todo('should add a new route to the router');
    it.todo('should add a new route to the router with no name');
    it.todo('should add a new route to the router with children');

    it.todo('should throw a RouterNameConflictError if a route with the same name already exists');
    it.todo('should throw a RouterPathConflictError if a route with the same path already exists');
  });

  describe('removeRoute', () => {
    it.todo('should remove an existing route by its name');
    it.todo('should remove an existing route by its path');
    it.todo('should return false if the route does not exist');
    it.todo('should return false if no name or path is provided');
    it.todo('should throw a RouterNamePathMismatchError if the path provided and registered do not match');
    it.todo('should throw a RouterNamePathMismatchError if the name provided and registered do not match');
  });

  describe('beforeEach', () => {
    it.todo('should add a navigation guard to be called before each navigation');
    it.todo('should remove a navigation guard when the returned function is called');
  });

  describe('afterEach', () => {
    it.todo('should add a navigation guard to be called after each navigation');
    it.todo('should remove a navigation guard when the returned function is called');
  });

  describe('onLoading', () => {
    it.todo('should add a navigation guard to be called when a navigation is loading');
    it.todo('should remove a navigation guard when the returned function is called');
  });

  describe('onLoaded', () => {
    it.todo('should add a navigation guard to be called when a navigation is loaded');
    it.todo('should remove a navigation guard when the returned function is called');
  });

  describe('onError', () => {
    it.todo('should add a navigation guard to be called when a navigation has an error');
    it.todo('should remove a navigation guard when the returned function is called');
  });

  describe('resolve', () => {
    describe('name', () => {
      it.todo('should resolve a route from a name');
      it.todo('should resolve a route from a name with param parameters');
      it.todo('should resolve a route from a name with query parameters');
      it.todo('should resolve a route from a name with both param and query parameters');

      it.todo('should resolve a route from a name and default parameters');
      it.todo('should resolve a route from a name and override default parameters');
      it.todo('should resolve a route and inject query parameters');
      it.todo('should resolve a route and override query parameters');
    });

    describe('location', () => {
      it.todo('should resolve a route from an absolute location');
      it.todo('should resolve a route from a relative location');
      it.todo('should resolve a route from a location with param parameters');
      it.todo('should resolve a route from a location with query parameters');
      it.todo('should resolve a route from a location with both param and query parameters');

      it.todo('should resolve a route from a name and default parameters');
      it.todo('should resolve a route from a name and override default parameters');
      it.todo('should resolve a route and inject query parameters');
      it.todo('should resolve a route and override query parameters');
    });

    describe('matching', () => {
      it.todo('should fail to parse an invalid path');
      it.todo('should fail with a NavigationNotFoundError if the route does not exist and failOnNotFound is true');
      it.todo('should return undefined if an exact match is not found and strict is true');
      it.todo('should return the first match if an exact match is not found and strict is false');
    });
  });

  describe('navigate', () => {
    describe('push', () => {
      it.todo('should push a new entry to the history for a location');
      it.todo('should push a new entry to the history for a name');
      it.todo('should push a new entry to the history with a title');
      it.todo('should push a new entry to the history with a state');
      it.todo('should push a new entry to the history with a title and state');
      it.todo('should call #navigate when push is called');
      it.todo('should throw a NavigationCancelledError if the navigation is cancelled by new navigation');
      it.todo('should throw a NavigationAbortedError if the navigation is aborted by a navigation guard');
      it.todo('should throw a NavigationNotFoundError if the route does not exist and failOnNotFound is true');

      it.todo('should not navigate if the target route and location are the same as the current route');
    });

    describe('replace', () => {
      it.todo('should replace the current entry in the history with a location');
      it.todo('should replace the current entry in the history with a name');
      it.todo('should replace the current entry in the history with a title');
      it.todo('should replace the current entry in the history with a state');
      it.todo('should replace the current entry in the history with a title and state');
      it.todo('should call #navigate when replace is called');
      it.todo('should throw a NavigationCancelledError if the navigation is cancelled by new navigation');
      it.todo('should throw a NavigationAbortedError if the navigation is aborted by a navigation guard');
      it.todo('should throw a NavigationNotFoundError if the route does not exist and failOnNotFound is true');

      it.todo('should not navigate if the target route and location are the same as the current route');
    });

    describe('resolve', () => {
      describe('path mode', () => {
        it.todo('should resolve a route from a name');
        it.todo('should resolve a route from a path');
        it.todo('should resolve a route from a hash path');
        it.todo('should resolve a route from a sub-path');
        it.todo('should resolve a route from a name in strict mode');
        it.todo('should resolve a route from a path in strict mode');
        it.todo('should not resolve a route from a sub-path in strict mode');
        it.todo('should resolve a route from a relative location');
        it.todo('should resolve a route from a location with param parameters');
        it.todo('should resolve a route from a location with query parameters');
        it.todo('should resolve a route from a location with both param and query parameters');
        it.todo('should fail with a NavigationNotFoundError if no path can be resolved');
        it.todo('should fail with a NavigationNotFoundError if a relative path could not be resolved');
        it.todo('should fail with a NavigationNotFoundError if the route does not exist and failOnNotFound is true');
      });

      describe('hash mode', () => {
        it.todo('should resolve a route from a name');
        it.todo('should resolve a route from a path');
        it.todo('should resolve a route from a hash path');
        it.todo('should resolve a route from a sub-path');
        it.todo('should resolve a route from a name in strict mode');
        it.todo('should resolve a route from a path in strict mode');
        it.todo('should not resolve a route from a sub-path in strict mode');
        it.todo('should resolve a route from a relative location');
        it.todo('should resolve a route from a location with param parameters');
        it.todo('should resolve a route from a location with query parameters');
        it.todo('should resolve a route from a location with both param and query parameters');
        it.todo('should fail with a NavigationNotFoundError if no path can be resolved');
        it.todo('should fail with a NavigationNotFoundError if a relative path could not be resolved');
        it.todo('should fail with a NavigationNotFoundError if the route does not exist and failOnNotFound is true');
      });
    });

    describe('go', () => {
      it.todo('should navigate forward to a location by its position in the history');
      it.todo('should navigate backward to a location by its position in the history');
    });

    describe('back', () => {
      it.todo('should navigate backward in the history');
    });

    describe('forward', () => {
      it.todo('should navigate forward in the history');
    });

    describe('listeners', () => {
      it.todo('should update state when unloading a page');
      it.todo('should update state when unloading a page when the state is different');
      it.todo('should not update state when unloading a page if the state is the same');

      it.todo('should call navigation listeners when popstate is triggered and window.navigation is undefined');
      it.todo('should call #navigate when popstate is triggered and a route is resolved from the hash in hash mode');
      it.todo('should call #navigate when popstate is triggered and a route is resolved from the path in path mode');
      it.todo('should call not call #navigate when popstate is triggered and a route is not resolved');

      it.todo('should call navigation listeners when navigate is triggered and window.navigation is defined');
      it.todo('should call #navigate when navigate is triggered and a route is resolved from the hash in hash mode');
      it.todo('should call #navigate when navigate is triggered and a route is resolved from the path in path mode');
      it.todo('should call not call #navigate when navigate is triggered and a route is not resolved');
    });
  });
});
