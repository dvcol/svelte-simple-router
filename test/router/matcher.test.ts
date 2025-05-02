import { describe, expect, it } from 'vitest';

import { MatcherInvalidPathError, ParsingMissingRequiredParamError } from '~/models/error.model.js';
import { Matcher, replaceTemplateParams, replaceTitleParams, templateToParams, templateToRegex } from '~/models/matcher.model.js';

describe('matcher', () => {
  describe('replaceTitleParams', () => {
    it('should replace title params with the provided params', () => {
      expect.assertions(1);

      const title = ':notification:? User Route - (:suffix) :optional:?';
      const params = { notification: '(10)', suffix: 12 };
      const path = '(10) User Route - (12)';

      expect(replaceTitleParams(title, params)).toBe(path);
    });

    it('should replace title params with the optionals params', () => {
      expect.assertions(1);

      const title = ':notification:? User Route - (:suffix) :optional:?';
      const params = { optional: 'My Path', suffix: 12 };
      const path = 'User Route - (12) My Path';

      expect(replaceTitleParams(title, params)).toBe(path);
    });
  });

  describe('replaceTemplateParams', () => {
    it('should replace template params with the provided params', () => {
      expect.assertions(1);

      const template = '/base/path/:id/:lastName/end';
      const params = { id: 12, lastName: 'doe' };
      const path = '/base/path/12/doe/end';

      expect(replaceTemplateParams(template, params)).toBe(path);
    });

    it('should replace template params with valid URI component', () => {
      expect.assertions(1);

      const template = '/base/path/:id/:lastName/end';
      const params = { id: 12, lastName: "Hello World!@#$%^&*()_+[]{}|;:',.<>?/`~ =" };
      const path = `/base/path/12/${encodeURIComponent(params.lastName)}/end`;

      expect(replaceTemplateParams(template, params)).toBe(path);
    });

    it('should strip the type from the template path then replace path params with the provided params', () => {
      expect.assertions(1);

      const template = '/base/path/*/:{number}:id:?/path/:{string}:name:?/:lastName/end';
      const params = { id: 12, name: 'john', lastName: 'doe' };
      const path = '/base/path/*/12/path/john/doe/end';

      expect(replaceTemplateParams(template, params)).toBe(path);
    });

    it('should throw a ParsingMissingRequiredParamError if a required param is missing', () => {
      expect.assertions(1);

      const template = '/base/path/:required/:optional:?/end';
      const params = { optional: 'john' };

      expect(() => replaceTemplateParams(template, params)).toThrow(new ParsingMissingRequiredParamError({ template, missing: 'required', params }));
    });

    it('should not throw a ParsingMissingRequiredParamError if an optional param is missing', () => {
      expect.assertions(1);

      const template = '/base/path/:required/:optional:?/end';
      const params = { required: 'doe' };
      const path = '/base/path/doe/end';

      expect(replaceTemplateParams(template, params)).toBe(path);
    });
  });

  describe('templateToRegex', () => {
    it('should convert a template to a regex', async () => {
      expect.assertions(1);
      const template = '/base/path/*/nb/:{number}:id:?/path/:{string}:name:?/:lastName/end';
      const regex = /^\/base\/path\/([^/]+)\/nb\/?(\d+)?\/path\/?(\w+)?\/([^/]+)\/end/;
      const strictRegex = /^\/base\/path\/([^/]+)\/nb\/?(\d+)?\/path\/?(\w+)?\/([^/]+)\/end$/;
      expect(templateToRegex(template)).toStrictEqual({ regex, strictRegex });
    });

    it('should throw a MatcherError if the template is empty or falsy', () => {
      expect.assertions(2);
      expect(() => templateToRegex('')).toThrow(new MatcherInvalidPathError(''));
      expect(() => templateToRegex(null)).toThrow(new MatcherInvalidPathError(null));
    });

    it('should replace number template params with a regex', () => {
      expect.assertions(1);
      const template = '/base/path/:{number}:id/end';
      const regex = /^\/base\/path\/(\d+)\/end/;
      const strictRegex = /^\/base\/path\/(\d+)\/end$/;
      expect(templateToRegex(template)).toStrictEqual({ regex, strictRegex });
    });

    it('should replace string template params with a regex', () => {
      expect.assertions(1);
      const template = '/base/path/:{string}:name/end';
      const regex = /^\/base\/path\/(\w+)\/end/;
      const strictRegex = /^\/base\/path\/(\w+)\/end$/;
      expect(templateToRegex(template)).toStrictEqual({ regex, strictRegex });
    });

    it('should replace optional template params with a regex', () => {
      expect.assertions(1);
      const template = '/base/path/:id:?/end';
      const regex = /^\/base\/path\/?([^/]+)?\/end/;
      const strictRegex = /^\/base\/path\/?([^/]+)?\/end$/;
      expect(templateToRegex(template)).toStrictEqual({ regex, strictRegex });
    });

    it('should replace optional number template params with a regex', () => {
      expect.assertions(1);
      const template = '/base/path/:{number}:id:?/end';
      const regex = /^\/base\/path\/?(\d+)?\/end/;
      const strictRegex = /^\/base\/path\/?(\d+)?\/end$/;
      expect(templateToRegex(template)).toStrictEqual({ regex, strictRegex });
    });

    it('should replace optional string template params with a regex', () => {
      expect.assertions(1);
      const template = '/base/path/:{string}:name:?/end';
      const regex = /^\/base\/path\/?(\w+)?\/end/;
      const strictRegex = /^\/base\/path\/?(\w+)?\/end$/;
      expect(templateToRegex(template)).toStrictEqual({ regex, strictRegex });
    });

    it('should prepend a slash to the template if it does not start with one', () => {
      expect.assertions(1);
      const template = 'base/path/:id/end';
      const regex = /^\/base\/path\/([^/]+)\/end/;
      const strictRegex = /^\/base\/path\/([^/]+)\/end$/;
      expect(templateToRegex(template)).toStrictEqual({ regex, strictRegex });
    });

    it('should replace with a wildcard', () => {
      expect.assertions(1);
      const template = '*';
      const regex = /^\/(.*)/;
      const strictRegex = /^\/(.*)$/;
      expect(templateToRegex(template)).toStrictEqual({ regex, strictRegex });
    });

    it('should replace with a segment ending wildcard', () => {
      expect.assertions(1);
      const template = '/base/path/*';
      const regex = /^\/base\/path\/(.*)/;
      const strictRegex = /^\/base\/path\/(.*)$/;
      expect(templateToRegex(template)).toStrictEqual({ regex, strictRegex });
    });

    it('should replace with a segment wildcard and a suffix', () => {
      expect.assertions(1);
      const template = '/*/end';
      const regex = /^\/([^/]+)\/end/;
      const strictRegex = /^\/([^/]+)\/end$/;
      expect(templateToRegex(template)).toStrictEqual({ regex, strictRegex });
    });

    it('should replace with a segment wildcard and a prefix and suffix', () => {
      expect.assertions(1);
      const template = '/base/*/end';
      const regex = /^\/base\/([^/]+)\/end/;
      const strictRegex = /^\/base\/([^/]+)\/end$/;
      expect(templateToRegex(template)).toStrictEqual({ regex, strictRegex });
    });
  });

  describe('templateToParams', () => {
    it('should extract params from a template', () => {
      expect.assertions(1);
      const template = '/base/path/:id/user/:{string}:firstName/:lastName/end';
      const params = ['id', 'firstName', 'lastName'];
      expect(templateToParams(template)).toStrictEqual(params);
    });

    it('should extract params from a template with wildcards', () => {
      expect.assertions(1);
      const template = '/base/path/*/:id/user/:{string}:firstName/:lastName/end';
      const params = ['*', 'id', 'firstName', 'lastName'];
      expect(templateToParams(template)).toStrictEqual(params);
    });

    it('should extract params from a template with optional params', () => {
      expect.assertions(1);
      const template = '/base/path/*/:id/user/:{string}:firstName/:lastName:?/end';
      const params = ['*', 'id', 'firstName', 'lastName'];
      expect(templateToParams(template)).toStrictEqual(params);
    });

    it('should extract no params from a template with no params', () => {
      expect.assertions(1);
      const template = '/base/path/end';
      const params: string[] = [];
      expect(templateToParams(template)).toStrictEqual(params);
    });
  });

  describe('matcher', () => {
    const template = '/base/path/*/:{number}:id:?/path/:{string}:name:?/:lastName/end';

    it('should create a new Matcher instance', () => {
      expect.assertions(2);
      const matcher = new Matcher(template);
      expect(matcher).toBeDefined();
      expect(matcher).toBeInstanceOf(Matcher);
    });

    describe('match', () => {
      describe('path', () => {
        it('should match an exact location pathname with the route path', () => {
          expect.assertions(2);
          const matcher = new Matcher('/path');
          expect(matcher.match('/path')).toBeTruthy();
          expect(matcher.match('/other')).toBeFalsy();
        });

        it('should match a location pathname with a sub-path', () => {
          expect.assertions(2);
          const matcher = new Matcher('/path');
          expect(matcher.match('/path/sub')).toBeTruthy();
          expect(matcher.match('/other/sub')).toBeFalsy();
        });

        it('should match a sub pathname with a sub-path', () => {
          expect.assertions(2);
          const matcher = new Matcher('/path/sub');
          expect(matcher.match('/path/sub')).toBeTruthy();
          expect(matcher.match('/other/sub')).toBeFalsy();
        });
      });

      describe('wildcard', () => {
        it('should match a wildcard path', () => {
          expect.assertions(3);
          const matcher = new Matcher('*');
          expect(matcher.match('/path')).toBeTruthy();
          expect(matcher.match('/path/sub')).toBeTruthy();
          expect(matcher.match('/path/sub/other')).toBeTruthy();
        });

        it('should match a wildcard path with a prefix', () => {
          expect.assertions(6);
          const matcher = new Matcher('/base/path/*');
          expect(matcher.match('/base/path')).toBeFalsy();
          expect(matcher.match('/other/path')).toBeFalsy();
          expect(matcher.match('/base/path/sub')).toBeTruthy();
          expect(matcher.match('/other/path/sub')).toBeFalsy();
          expect(matcher.match('/base/path/sub/end')).toBeTruthy();
          expect(matcher.match('/other/path/sub/end')).toBeFalsy();
        });

        it('should match a wildcard path with a suffix', () => {
          expect.assertions(4);
          const matcher = new Matcher('/*/path');
          expect(matcher.match('/path')).toBeFalsy();
          expect(matcher.match('/base/path')).toBeTruthy();
          expect(matcher.match('/other/path/sub')).toBeTruthy();
          expect(matcher.match('/base/other')).toBeFalsy();
        });

        it('should match a wildcard path with a prefix and suffix', () => {
          expect.assertions(5);
          const matcher = new Matcher('/base/*/end');
          expect(matcher.match('/base/end')).toBeFalsy();
          expect(matcher.match('/base/path/end')).toBeTruthy();
          expect(matcher.match('/base/others/end')).toBeTruthy();
          expect(matcher.match('/other/path/end')).toBeFalsy();
          expect(matcher.match('/base/path/other/end')).toBeFalsy();
        });
      });

      describe('params', () => {
        it('should match a path with a required param', () => {
          expect.assertions(4);
          const matcher = new Matcher('/base/path/:id/end');
          expect(matcher.match('/base/path/12/end')).toBeTruthy();
          expect(matcher.match('/base/path/john/end')).toBeTruthy();
          expect(matcher.match('/base/path/end')).toBeFalsy();
          expect(matcher.match('/base/path/12')).toBeFalsy();
        });

        it('should only match number params with a number template', () => {
          expect.assertions(4);
          const matcher = new Matcher('/base/path/:{number}:id/end');
          expect(matcher.match('/base/path/12/end')).toBeTruthy();
          expect(matcher.match('/base/path/john/end')).toBeFalsy();
          expect(matcher.match('/base/path/end')).toBeFalsy();
          expect(matcher.match('/base/path/12')).toBeFalsy();
        });

        it('should only match string params with a string template', () => {
          expect.assertions(4);
          const matcher = new Matcher('/base/path/:{string}:id/end');
          expect(matcher.match('/base/path/&§/end')).toBeFalsy();
          expect(matcher.match('/base/path/john/end')).toBeTruthy();
          expect(matcher.match('/base/path/end')).toBeFalsy();
          expect(matcher.match('/base/path/12')).toBeFalsy();
        });

        it('should match a path with an optional param', () => {
          expect.assertions(4);
          const matcher = new Matcher('/base/path/:id:?/end');
          expect(matcher.match('/base/path/12/end')).toBeTruthy();
          expect(matcher.match('/base/path/john/end')).toBeTruthy();
          expect(matcher.match('/base/path/end')).toBeTruthy();
          expect(matcher.match('/base/path/12')).toBeFalsy();
        });

        it('should match a path with a required and optional param', () => {
          expect.assertions(4);
          const matcher = new Matcher('/base/path/:id/:name:?/end');
          expect(matcher.match('/base/path/12/end')).toBeTruthy();
          expect(matcher.match('/base/path/12/john/end')).toBeTruthy();
          expect(matcher.match('/base/path/end')).toBeFalsy();
          expect(matcher.match('/base/path/12/john')).toBeFalsy();
        });

        it('should match a path with query params', () => {
          expect.assertions(2);
          const matcher = new Matcher('/base/path/:id/end');
          expect(matcher.match('/base/path/12/end?query=string')).toBeTruthy();
          expect(matcher.match('/base/path/end?query=string&other=string')).toBeFalsy();
        });
      });

      describe('strict', () => {
        describe('path', () => {
          it('should match an exact location pathname with the route path in strict mode', () => {
            expect.assertions(2);
            const matcher = new Matcher('/path');
            expect(matcher.match('/path', true)).toBeTruthy();
            expect(matcher.match('/other', true)).toBeFalsy();
          });

          it('should not match a location pathname with a sub-path in strict mode', () => {
            expect.assertions(2);
            const matcher = new Matcher('/path');
            expect(matcher.match('/path/sub', true)).toBeFalsy();
            expect(matcher.match('/other/sub', true)).toBeFalsy();
          });

          it('should match a sub pathname with a sub-path in strict mode', () => {
            expect.assertions(2);
            const matcher = new Matcher('/path/sub');
            expect(matcher.match('/path/sub', true)).toBeTruthy();
            expect(matcher.match('/other/sub', true)).toBeFalsy();
          });
        });

        describe('wildcard', () => {
          it('should match a wildcard path in strict mode', () => {
            expect.assertions(3);
            const matcher = new Matcher('*');
            expect(matcher.match('/path', true)).toBeTruthy();
            expect(matcher.match('/path/sub', true)).toBeTruthy();
            expect(matcher.match('/path/sub/other', true)).toBeTruthy();
          });

          it('should match a wildcard path with a prefix in strict mode', () => {
            expect.assertions(6);
            const matcher = new Matcher('/base/path/*');
            expect(matcher.match('/base/path', true)).toBeFalsy();
            expect(matcher.match('/other/path', true)).toBeFalsy();
            expect(matcher.match('/base/path/sub', true)).toBeTruthy();
            expect(matcher.match('/other/path/sub', true)).toBeFalsy();
            expect(matcher.match('/base/path/sub/end', true)).toBeTruthy();
            expect(matcher.match('/other/path/sub/end', true)).toBeFalsy();
          });

          it('should match a wildcard path with a suffix in strict mode', () => {
            expect.assertions(4);
            const matcher = new Matcher('/*/path');
            expect(matcher.match('/path', true)).toBeFalsy();
            expect(matcher.match('/base/path', true)).toBeTruthy();
            expect(matcher.match('/other/path/sub', true)).toBeFalsy();
            expect(matcher.match('/base/other', true)).toBeFalsy();
          });

          it('should match a wildcard path with a prefix and suffix in strict mode', () => {
            expect.assertions(5);
            const matcher = new Matcher('/base/*/end');
            expect(matcher.match('/base/end', true)).toBeFalsy();
            expect(matcher.match('/base/path/end', true)).toBeTruthy();
            expect(matcher.match('/base/others/end', true)).toBeTruthy();
            expect(matcher.match('/other/path/end', true)).toBeFalsy();
            expect(matcher.match('/base/path/other/end', true)).toBeFalsy();
          });
        });

        describe('params', () => {
          it('should match a path with a required param in strict mode', () => {
            expect.assertions(4);
            const matcher = new Matcher('/base/path/:id/end');
            expect(matcher.match('/base/path/12/end', true)).toBeTruthy();
            expect(matcher.match('/base/path/john/end', true)).toBeTruthy();
            expect(matcher.match('/base/path/end', true)).toBeFalsy();
            expect(matcher.match('/base/path/12', true)).toBeFalsy();
          });

          it('should only match number params with a number template in strict mode', () => {
            expect.assertions(4);
            const matcher = new Matcher('/base/path/:{number}:id/end');
            expect(matcher.match('/base/path/12/end', true)).toBeTruthy();
            expect(matcher.match('/base/path/john/end', true)).toBeFalsy();
            expect(matcher.match('/base/path/end', true)).toBeFalsy();
            expect(matcher.match('/base/path/12', true)).toBeFalsy();
          });

          it('should only match string params with a string template in strict mode', () => {
            expect.assertions(4);
            const matcher = new Matcher('/base/path/:{string}:id/end');
            expect(matcher.match('/base/path/&§/end', true)).toBeFalsy();
            expect(matcher.match('/base/path/john/end', true)).toBeTruthy();
            expect(matcher.match('/base/path/end', true)).toBeFalsy();
            expect(matcher.match('/base/path/12', true)).toBeFalsy();
          });

          it('should match a path with an optional param  in strict mode', () => {
            expect.assertions(4);
            const matcher = new Matcher('/base/path/:id:?/end');
            expect(matcher.match('/base/path/12/end', true)).toBeTruthy();
            expect(matcher.match('/base/path/john/end', true)).toBeTruthy();
            expect(matcher.match('/base/path/end', true)).toBeTruthy();
            expect(matcher.match('/base/path/12', true)).toBeFalsy();
          });

          it('should match a path with a required and optional param in strict mode', () => {
            expect.assertions(4);
            const matcher = new Matcher('/base/path/:id/:name:?/end');
            expect(matcher.match('/base/path/12/end', true)).toBeTruthy();
            expect(matcher.match('/base/path/12/john/end', true)).toBeTruthy();
            expect(matcher.match('/base/path/end', true)).toBeFalsy();
            expect(matcher.match('/base/path/12/john', true)).toBeFalsy();
          });

          it('should match a path with query params in strict mode', () => {
            expect.assertions(2);
            const matcher = new Matcher('/base/path/:id/end');
            expect(matcher.match('/base/path/12/end?query=string', true)).toBeTruthy();
            expect(matcher.match('/base/path/end?query=string&other=string', true)).toBeFalsy();
          });
        });
      });
    });

    describe('hash', () => {
      describe('path', () => {
        it('should match an exact location hash with the route path', () => {
          expect.assertions(2);
          const matcher = new Matcher('/path');
          expect(matcher.match('/#/path')).toBeTruthy();
          expect(matcher.match('/#/other')).toBeFalsy();
        });

        it('should match a location hash with a sub-path', () => {
          expect.assertions(2);
          const matcher = new Matcher('/path');
          expect(matcher.match('/#/path/sub')).toBeTruthy();
          expect(matcher.match('/#/other/sub')).toBeFalsy();
        });

        it('should match a sub pathname with a sub-path', () => {
          expect.assertions(2);
          const matcher = new Matcher('/path/sub');
          expect(matcher.match('/#/path/sub')).toBeTruthy();
          expect(matcher.match('/#/other/sub')).toBeFalsy();
        });
      });

      describe('wildcard', () => {
        it('should match a wildcard path', () => {
          expect.assertions(3);
          const matcher = new Matcher('*');
          expect(matcher.match('/#/path')).toBeTruthy();
          expect(matcher.match('/#/path/sub')).toBeTruthy();
          expect(matcher.match('/#/path/sub/other')).toBeTruthy();
        });

        it('should match a wildcard path with a prefix', () => {
          expect.assertions(6);
          const matcher = new Matcher('/base/path/*');
          expect(matcher.match('/#/base/path')).toBeFalsy();
          expect(matcher.match('/#/other/path')).toBeFalsy();
          expect(matcher.match('/#/base/path/sub')).toBeTruthy();
          expect(matcher.match('/#/other/path/sub')).toBeFalsy();
          expect(matcher.match('/#/base/path/sub/end')).toBeTruthy();
          expect(matcher.match('/#/other/path/sub/end')).toBeFalsy();
        });

        it('should match a wildcard path with a suffix', () => {
          expect.assertions(4);
          const matcher = new Matcher('/*/path');
          expect(matcher.match('/#/path')).toBeFalsy();
          expect(matcher.match('/#/base/path')).toBeTruthy();
          expect(matcher.match('/#/other/path/sub')).toBeTruthy();
          expect(matcher.match('/#/base/other')).toBeFalsy();
        });

        it('should match a wildcard path with a prefix and suffix', () => {
          expect.assertions(5);
          const matcher = new Matcher('/base/*/end');
          expect(matcher.match('/#/base/end')).toBeFalsy();
          expect(matcher.match('/#/base/path/end')).toBeTruthy();
          expect(matcher.match('/#/base/others/end')).toBeTruthy();
          expect(matcher.match('/#/other/path/end')).toBeFalsy();
          expect(matcher.match('/#/base/path/other/end')).toBeFalsy();
        });
      });

      describe('params', () => {
        it('should match a path with a required param', () => {
          expect.assertions(4);
          const matcher = new Matcher('/base/path/:id/end');
          expect(matcher.match('/#/base/path/12/end')).toBeTruthy();
          expect(matcher.match('/#/base/path/john/end')).toBeTruthy();
          expect(matcher.match('/#/base/path/end')).toBeFalsy();
          expect(matcher.match('/#/base/path/12')).toBeFalsy();
        });

        it('should only match number params with a number template', () => {
          expect.assertions(4);
          const matcher = new Matcher('/base/path/:{number}:id/end');
          expect(matcher.match('/#/base/path/12/end')).toBeTruthy();
          expect(matcher.match('/#/base/path/john/end')).toBeFalsy();
          expect(matcher.match('/#/base/path/end')).toBeFalsy();
          expect(matcher.match('/#/base/path/12')).toBeFalsy();
        });

        it('should only match string params with a string template', () => {
          expect.assertions(4);
          const matcher = new Matcher('/base/path/:{string}:id/end');
          expect(matcher.match('/#/base/path/&§/end')).toBeFalsy();
          expect(matcher.match('/#/base/path/john/end')).toBeTruthy();
          expect(matcher.match('/#/base/path/end')).toBeFalsy();
          expect(matcher.match('/#/base/path/12')).toBeFalsy();
        });

        it('should match a path with an optional param', () => {
          expect.assertions(4);
          const matcher = new Matcher('/base/path/:id:?/end');
          expect(matcher.match('/#/base/path/12/end')).toBeTruthy();
          expect(matcher.match('/#/base/path/john/end')).toBeTruthy();
          expect(matcher.match('/#/base/path/end')).toBeTruthy();
          expect(matcher.match('/#/base/path/12')).toBeFalsy();
        });

        it('should match a path with a required and optional param', () => {
          expect.assertions(4);
          const matcher = new Matcher('/base/path/:id/:name:?/end');
          expect(matcher.match('/#/base/path/12/end')).toBeTruthy();
          expect(matcher.match('/#/base/path/12/john/end')).toBeTruthy();
          expect(matcher.match('/#/base/path/end')).toBeFalsy();
          expect(matcher.match('/#/base/path/12/john')).toBeFalsy();
        });

        it('should match a path with query params', () => {
          expect.assertions(2);
          const matcher = new Matcher('/base/path/:id/end');
          expect(matcher.match('/#/base/path/12/end?query=string')).toBeTruthy();
          expect(matcher.match('/#/base/path/end?query=string&other=string')).toBeFalsy();
        });
      });

      describe('strict', () => {
        describe('path', () => {
          it('should match an exact location hash with the route path in strict mode', () => {
            expect.assertions(2);
            const matcher = new Matcher('/path');
            expect(matcher.match('/#/path', true)).toBeTruthy();
            expect(matcher.match('/#/other', true)).toBeFalsy();
          });

          it('should match a location hash with a sub-path in strict mode', () => {
            expect.assertions(2);
            const matcher = new Matcher('/path');
            expect(matcher.match('/#/path/sub', true)).toBeFalsy();
            expect(matcher.match('/#/other/sub', true)).toBeFalsy();
          });

          it('should match a sub pathname with a sub-path in strict mode', () => {
            expect.assertions(2);
            const matcher = new Matcher('/path/sub');
            expect(matcher.match('/#/path/sub', true)).toBeTruthy();
            expect(matcher.match('/#/other/sub', true)).toBeFalsy();
          });
        });

        describe('wildcard', () => {
          it('should match a wildcard path in strict mode', () => {
            expect.assertions(3);
            const matcher = new Matcher('*');
            expect(matcher.match('/#/path', true)).toBeTruthy();
            expect(matcher.match('/#/path/sub', true)).toBeTruthy();
            expect(matcher.match('/#/path/sub/other', true)).toBeTruthy();
          });

          it('should match a wildcard path with a prefix in strict mode', () => {
            expect.assertions(6);
            const matcher = new Matcher('/base/path/*');
            expect(matcher.match('/#/base/path', true)).toBeFalsy();
            expect(matcher.match('/#/other/path', true)).toBeFalsy();
            expect(matcher.match('/#/base/path/sub', true)).toBeTruthy();
            expect(matcher.match('/#/other/path/sub', true)).toBeFalsy();
            expect(matcher.match('/#/base/path/sub/end', true)).toBeTruthy();
            expect(matcher.match('/#/other/path/sub/end', true)).toBeFalsy();
          });

          it('should match a wildcard path with a suffix in strict mode', () => {
            expect.assertions(4);
            const matcher = new Matcher('/*/path');
            expect(matcher.match('/#/path', true)).toBeFalsy();
            expect(matcher.match('/#/base/path', true)).toBeTruthy();
            expect(matcher.match('/#/other/path/sub', true)).toBeFalsy();
            expect(matcher.match('/#/base/other', true)).toBeFalsy();
          });

          it('should match a wildcard path with a prefix and suffix in strict mode', () => {
            expect.assertions(5);
            const matcher = new Matcher('/base/*/end');
            expect(matcher.match('/#/base/end', true)).toBeFalsy();
            expect(matcher.match('/#/base/path/end', true)).toBeTruthy();
            expect(matcher.match('/#/base/others/end', true)).toBeTruthy();
            expect(matcher.match('/#/other/path/end', true)).toBeFalsy();
            expect(matcher.match('/#/base/path/other/end', true)).toBeFalsy();
          });
        });

        describe('params', () => {
          it('should match a path with a required param in strict mode', () => {
            expect.assertions(4);
            const matcher = new Matcher('/base/path/:id/end');
            expect(matcher.match('/#/base/path/12/end', true)).toBeTruthy();
            expect(matcher.match('/#/base/path/john/end', true)).toBeTruthy();
            expect(matcher.match('/#/base/path/end', true)).toBeFalsy();
            expect(matcher.match('/#/base/path/12', true)).toBeFalsy();
          });

          it('should only match number params with a number template in strict mode', () => {
            expect.assertions(4);
            const matcher = new Matcher('/base/path/:{number}:id/end');
            expect(matcher.match('/#/base/path/12/end', true)).toBeTruthy();
            expect(matcher.match('/#/base/path/john/end', true)).toBeFalsy();
            expect(matcher.match('/#/base/path/end', true)).toBeFalsy();
            expect(matcher.match('/#/base/path/12', true)).toBeFalsy();
          });

          it('should only match string params with a string template in strict mode', () => {
            expect.assertions(4);
            const matcher = new Matcher('/base/path/:{string}:id/end');
            expect(matcher.match('/#/base/path/&§/end', true)).toBeFalsy();
            expect(matcher.match('/#/base/path/john/end', true)).toBeTruthy();
            expect(matcher.match('/#/base/path/end', true)).toBeFalsy();
            expect(matcher.match('/#/base/path/12', true)).toBeFalsy();
          });

          it('should match a path with an optional param in strict mode', () => {
            expect.assertions(4);
            const matcher = new Matcher('/base/path/:id:?/end');
            expect(matcher.match('/#/base/path/12/end', true)).toBeTruthy();
            expect(matcher.match('/#/base/path/john/end', true)).toBeTruthy();
            expect(matcher.match('/#/base/path/end', true)).toBeTruthy();
            expect(matcher.match('/#/base/path/12', true)).toBeFalsy();
          });

          it('should match a path with a required and optional param in strict mode', () => {
            expect.assertions(4);
            const matcher = new Matcher('/base/path/:id/:name:?/end');
            expect(matcher.match('/#/base/path/12/end', true)).toBeTruthy();
            expect(matcher.match('/#/base/path/12/john/end', true)).toBeTruthy();
            expect(matcher.match('/#/base/path/end', true)).toBeFalsy();
            expect(matcher.match('/#/base/path/12/john', true)).toBeFalsy();
          });

          it('should match a path with query params in strict mode', () => {
            expect.assertions(2);
            const matcher = new Matcher('/base/path/:id/end');
            expect(matcher.match('/#/base/path/12/end?query=string', true)).toBeTruthy();
            expect(matcher.match('/#/base/path/end?query=string&other=string', true)).toBeFalsy();
          });
        });
      });
    });

    describe('extract', () => {
      it('should extract params from a location with params', () => {
        expect.assertions(1);
        const matcher = new Matcher(template);
        const path = '/base/path/something/12/path/john/doe/end';
        const params = { id: 12, name: 'john', lastName: 'doe' };
        const wildcards = { 1: 'something' };
        expect(matcher.extract(path)).toStrictEqual({ params, wildcards });
      });

      it('should extract params from a location with uri component params', () => {
        expect.assertions(1);
        const matcher = new Matcher(template);
        const params = { id: 12, name: 'john', lastName: "Hello World!@#$%^&*()_+[]{}|;:',.<>?/`~ =" };
        const path = `/base/path/something/12/path/john/${encodeURIComponent(params.lastName)}/end`;
        const wildcards = { 1: 'something' };
        expect(matcher.extract(path)).toStrictEqual({ params, wildcards });
      });

      it('should extract params from a location with number params', () => {
        expect.assertions(1);
        const matcher = new Matcher('/base/path/:{number}:id/end');
        const path = '/base/path/12/end';
        const params = { id: 12 };
        const wildcards = {};
        expect(matcher.extract(path)).toStrictEqual({ params, wildcards });
      });

      it('should not extract string params from a location with number params', () => {
        expect.assertions(1);
        const matcher = new Matcher('/base/path/:{number}:id/end');
        const path = '/base/path/john/end';
        const params = {};
        const wildcards = {};
        expect(matcher.extract(path)).toStrictEqual({ params, wildcards });
      });

      it('should extract params from a location with string params', () => {
        expect.assertions(1);
        const matcher = new Matcher('/base/path/:{string}:id/end');
        const path = '/base/path/john/end';
        const params = { id: 'john' };
        const wildcards = {};
        expect(matcher.extract(path)).toStrictEqual({ params, wildcards });
      });

      it('should not extract non [a-zA-Z0-9_] params from a location with string params', () => {
        expect.assertions(1);
        const matcher = new Matcher('/base/path/:{string}:id/end');
        const path = '/base/path/§&/end';
        const params = {};
        const wildcards = {};
        expect(matcher.extract(path)).toStrictEqual({ params, wildcards });
      });

      it('should extract params from a location with both number and string params', () => {
        expect.assertions(1);
        const matcher = new Matcher('/base/path/:{number}:id/:{string}:name/end');
        const path = '/base/path/12/john/end';
        const params = { id: 12, name: 'john' };
        const wildcards = {};
        expect(matcher.extract(path)).toStrictEqual({ params, wildcards });
      });

      it('should extract params from a location with optional params', () => {
        expect.assertions(1);
        const matcher = new Matcher('/base/path/:id/:first:?/:name/end');
        const path = '/base/path/12/john/doe/end';
        const params = { id: 12, first: 'john', name: 'doe' };
        const wildcards = {};
        expect(matcher.extract(path)).toStrictEqual({ params, wildcards });
      });

      it('should extract params from a location with missing optional params', () => {
        expect.assertions(1);
        const matcher = new Matcher('/base/path/:id/:first:?/:name/end');
        const path = '/base/path/12/doe/end';
        const params = { id: 12, first: undefined, name: 'doe' };
        const wildcards = {};
        expect(matcher.extract(path)).toStrictEqual({ params, wildcards });
      });

      it('should extract params from a location with wildcards', () => {
        expect.assertions(1);
        const matcher = new Matcher('/base/:boolean/path/*/segment/*/end');
        const path = '/base/FALSE/path/something/segment/else/end';
        const params = { boolean: false };
        const wildcards = { 2: 'something', 3: 'else' };
        expect(matcher.extract(path)).toStrictEqual({ params, wildcards });
      });

      it('should extract params from a location with params and wildcards', () => {
        expect.assertions(1);
        const matcher = new Matcher('/base/:boolean/path/*/segment/:id/*');
        const path = '/base/true/path/something/segment/12/segment/end';
        const params = { id: 12, boolean: true };
        const wildcards = { 2: 'something', 4: 'segment/end' };
        expect(matcher.extract(path)).toStrictEqual({ params, wildcards });
      });

      it('should extract params from a location with missing optional params and wildcards', () => {
        expect.assertions(1);
        const matcher = new Matcher('/base/path/*/segment/:{number}:id:?/*');
        const path = '/base/path/something/segment/path/sub-path/end';
        const params = { id: undefined };
        const wildcards = { 1: 'something', 3: 'path/sub-path/end' };
        expect(matcher.extract(path)).toStrictEqual({ params, wildcards });
      });

      it('should extract no params from a location with no params', () => {
        expect.assertions(1);
        const matcher = new Matcher('/base/path/end');
        const path = '/base/path/end';
        const params = {};
        const wildcards = {};
        expect(matcher.extract(path)).toStrictEqual({ params, wildcards });
      });
    });
  });
});
