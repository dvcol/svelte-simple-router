import type { Route, RouteName, RouteParams } from '~/models/route.model.js';

import { MatcherInvalidPathError } from '~/models/error.model.js';

const pathParamRegex = /\/:[^/]+/g;
const pathParamReplace = '/[^/]+';

const pathParamRegexNumber = /\/:{number}:[^/]+/g;
const pathParamReplaceNumber = '/d+';

const pathParamRegexString = /\/:{string}:[^/]+/g;
const pathParamReplaceString = '/w+';

const relativePathRegex = /^\.+\//;
const hashPathRegex = /^\/?#/;

const pathParamRegexPrefix = /\/:{(number|string)}:/g;
const pathParamReplacePrefix = '/:';

export const replacePathParams = (path: string, params: RouteParams) =>
  path?.replace(pathParamRegexPrefix, pathParamReplacePrefix).replace(pathParamRegex, match => {
    const paramName = match.slice(2);
    return `/${params[paramName]}`;
  });

export const pathToRegex = (path: string) => {
  let _path = path?.trim();
  if (!_path?.length) throw new MatcherInvalidPathError(path);
  if (relativePathRegex.test(_path)) throw new MatcherInvalidPathError(path, `Path should be absolute, but "${_path}" seems to be relative.`);
  if (!_path.startsWith('/')) _path = `/${_path}`;

  const strRegex = _path
    .replace(pathParamRegexString, pathParamReplaceString)
    .replace(pathParamRegexNumber, pathParamReplaceNumber)
    .replace(pathParamRegex, pathParamReplace);

  return {
    regex: new RegExp(`^${strRegex}`),
    strictRegex: new RegExp(`^${strRegex}$`),
  };
};

export class Matcher<Name extends RouteName = string> {
  readonly #route: Route<Name>;
  readonly #regex: RegExp;
  readonly #strictRegex: RegExp;

  constructor(route: Route<Name>) {
    this.#route = route;
    const { regex, strictRegex } = pathToRegex(route.path);
    this.#regex = regex;
    this.#strictRegex = strictRegex;
  }

  match(path: string, { base, strict }: { base?: string; strict?: boolean }): boolean {
    if (base && !path.startsWith(base)) return false;
    const _path = path?.trim()?.split('?')?.at(0)?.replace(hashPathRegex, '');
    if (!_path) return false;
    if (strict) return this.#strictRegex.test(_path);
    return this.#regex.test(_path);
  }
}
