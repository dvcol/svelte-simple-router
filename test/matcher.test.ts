import { describe, it } from 'vitest';

describe('matcher', () => {
  describe('replaceTemplateParams', () => {
    it.todo('should replace template params with the provided params');
    it.todo('should strip the type from the template path then replace path params with the provided params');
    it.todo('should throw a ParsingMissingRequiredParamError if a required param is missing');
    it.todo('should not throw a ParsingMissingRequiredParamError if an optional param is missing');
  });

  describe('templateToRegex', () => {
    it.todo('should convert a template to a regex');
    it.todo('should throw a MatcherError if the template is empty or falsy');

    it.todo('should replace number template params with a regex');
    it.todo('should replace string template params with a regex');

    it.todo('should replace optional template params with a regex');
    it.todo('should replace optional number template params with a regex');
    it.todo('should replace optional string template params with a regex');

    it.todo('should prepend a slash to the template if it does not start with one');

    it.todo('should replace with a segment wildcard');
    it.todo('should replace with a segment wildcard and a prefix');
    it.todo('should replace with a segment wildcard and a suffix');
    it.todo('should replace with a segment wildcard and a prefix and suffix');

    it.todo('should replace with a segment ending wildcard');
  });

  describe('templateToParams', () => {
    it.todo('should extract params from a template');
    it.todo('should extract params from a template with wildcards');
    it.todo('should extract params from a template with optional params');
    it.todo('should extract params from a template with wildcards and optional params');
    it.todo('should extract no params from a template with no params');
  });

  describe('matcher', () => {
    it.todo('should create a new Matcher instance');

    describe('path', () => {
      it.todo('should match an exact location pathname with the route path');
      it.todo('should match a location pathname with a sub-path');

      it.todo('should match an exact location pathname with the route path and a base path');
      it.todo('should match a location pathname with a sub-path and a base path');

      it.todo('should not match an exact location pathname with a different base path');
      it.todo('should not match a location pathname with a sub-path and a different base path');

      it.todo('should match a wildcard path');
      it.todo('should match a wildcard path with a prefix');
      it.todo('should match a wildcard path with a suffix');
      it.todo('should match a wildcard path with a prefix and suffix');

      it.todo('should match a path with a required param');
      it.todo('should match a path with an optional param');
      it.todo('should match a path with a required and optional param');
      it.todo('should throw a ParsingMissingRequiredParamError if a required param is missing');

      describe('strict', () => {
        it.todo('should match an exact location pathname with the route path in strict mode');
        it.todo('should not match a location pathname with a sub-path in strict mode');

        it.todo('should match an exact location pathname with the route path and a base path in strict mode');
        it.todo('should not match a location pathname with a sub-path and a base path in strict mode');

        it.todo('should not match an exact location pathname with a different base path in strict mode');
        it.todo('should not match a location pathname with a sub-path and a different base path in strict mode');

        it.todo('should match a wildcard path in strict mode');
        it.todo('should match a wildcard path with a prefix in strict mode');
        it.todo('should match a wildcard path with a suffix in strict mode');
        it.todo('should match a wildcard path with a prefix and suffix in strict mode');

        it.todo('should match a path with a required param in strict mode');
        it.todo('should match a path with an optional param in strict mode');
        it.todo('should match a path with a required and optional param in strict mode');
        it.todo('should throw a ParsingMissingRequiredParamError if a required param is missing in strict mode');
      });
    });

    describe('hash', () => {
      it.todo('should match an exact location hash with the route path');
      it.todo('should match a location hash with a sub-path');

      it.todo('should match an exact location hash with the route path and a base path');
      it.todo('should match a location hash with a sub-path and a base path');

      it.todo('should not match an exact location hash with a different base path');
      it.todo('should not match a location hash with a sub-path and a different base path');

      describe('strict', () => {
        it.todo('should match an exact location hash with the route path in strict mode');
        it.todo('should not match a location hash with a sub-path in strict mode');

        it.todo('should match an exact location hash with the route path and a base path in strict mode');
        it.todo('should not match a location hash with a sub-path and a base path in strict mode');

        it.todo('should not match an exact location hash with a different base path in strict mode');
        it.todo('should not match a location hash with a sub-path and a different base path in strict mode');
      });
    });

    describe('extract', () => {
      it.todo('should extract params from a location with params');
      it.todo('should extract params from a location with number params');
      it.todo('should extract params from a location with string params');
      it.todo('should extract params from a location with both number and string params');
      it.todo('should extract params from a location with optional params');

      it.todo('should extract params from a location with wildcards');
      it.todo('should extract params from a location with params and wildcards');
      it.todo('should extract no params from a location with no params');
    });
  });
});
