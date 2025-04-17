import type { Route, RouteName, RouteParams } from '~/models/route.model.js';

import { MatcherInvalidPathError, ParsingMissingRequiredParamError } from '~/models/error.model.js';

const templateParamRegex = /\/:[^/]+/g;
const templateParamReplace = '/([^/]+)';

const templateParamRegexNumber = /\/:\{number\}:[^/]+/g;
const templateParamReplaceNumber = '/(\\d+)';

const templateParamRegexString = /\/:\{string\}:[^/]+/g;
const templateParamReplaceString = '/(\\w+)';

const optionalTemplateParamRegex = /\/:[^/]+:\?/g;
const optionalTemplateParamReplace = '/?([^/]+)?';

const optionalTemplateParamRegexNumber = /\/:\{number\}:[^/]+:\?/g;
const optionalTemplateParamReplaceNumber = '/?(\\d+)?';

const optionalTemplateParamRegexString = /\/:\{string\}:[^/]+:\?/g;
const optionalTemplateParamReplaceString = '/?(\\w+)?';

const relativePathRegex = /^\.+\//;
const hashPathRegex = /^\/?#/;

const templateParamRegexPrefix = /\/:\{(?:number|string)\}:/g;
const templateParamReplacePrefix = '/:';

const templateParamRegexSuffix = /:\?(?:\/|$)/g;
const templateParamReplaceSuffix = '/';

const templateWildcardRegex = /\/\*$/g;
const templateWildcardReplace = '/(.*)';

const templateWildcardSegment = /\/\*\//g;
const templateWildcardSegmentReplace = '/([^/]+)/';

const templateWildcardOrParamRegex = /\/(?:\*|:[^/]+)/g;
const templateWildcardOrParamPrefixRegex = /^\/:?/g;

const titleParamRegexPrefix = /:\{number|string\}:/g;
const titleParamReplacePrefix = ':';
const titleParamRegex = /:([\w:?{}])+/g;

function replacer(match: string, params: RouteParams, slice = 2) {
  let paramName = match.slice(slice);
  const optional = paramName.endsWith(':?');
  if (optional) paramName = paramName.slice(0, -2);
  return { param: paramName, value: params[paramName], optional };
}

export function replaceTitleParams(title: string, params: RouteParams = {}) {
  return title
    ?.replace(titleParamRegexPrefix, titleParamReplacePrefix)
    .replace(titleParamRegex, (match) => {
      const { value, optional } = replacer(match, params, 1);
      return String(value ?? (optional ? '' : match));
    })
    .trim();
}

/**
 * Replaces template params with their values
 * @param template
 * @param params
 * @throws {ParsingMissingRequiredParamError} when a required param is missing
 */
export function replaceTemplateParams(template: string, params: RouteParams = {}) {
  return template?.replace(templateParamRegexPrefix, templateParamReplacePrefix).replace(templateParamRegex, (match) => {
    const { param, value, optional } = replacer(match, params);

    if (value === undefined) {
      if (optional) return '';
      throw new ParsingMissingRequiredParamError({ template, missing: param, params });
    }

    return `/${value}`;
  });
}

/**
 * Converts a template path to a regex
 * @param template
 * @throws {MatcherInvalidPathError} when the template is invalid (empty or relative)
 */
export function templateToRegex(template: string) {
  let _template = template?.trim();
  if (!_template?.length) throw new MatcherInvalidPathError(template);
  if (relativePathRegex.test(_template))
    throw new MatcherInvalidPathError(template, `Path should be absolute, but "${_template}" seems to be relative.`);
  if (!_template.startsWith('/')) _template = `/${_template}`;

  const strRegex = _template
    .replace(optionalTemplateParamRegexString, optionalTemplateParamReplaceString)
    .replace(optionalTemplateParamRegexNumber, optionalTemplateParamReplaceNumber)
    .replace(optionalTemplateParamRegex, optionalTemplateParamReplace)
    .replace(templateParamRegexString, templateParamReplaceString)
    .replace(templateParamRegexNumber, templateParamReplaceNumber)
    .replace(templateParamRegex, templateParamReplace)
    .replace(templateWildcardSegment, templateWildcardSegmentReplace)
    .replace(templateWildcardRegex, templateWildcardReplace);

  return {
    regex: new RegExp(`^${strRegex}`),
    strictRegex: new RegExp(`^${strRegex}$`),
  };
}

/**
 * Extracts params from a template path
 * @param template
 * @throws {MatcherInvalidPathError} when the template is invalid (empty)
 */
export function templateToParams(template: string) {
  const _template = template?.trim();
  if (!_template?.length) throw new MatcherInvalidPathError(template);
  return (
    _template
      .replace(templateParamRegexPrefix, templateParamReplacePrefix)
      .replace(templateParamRegexSuffix, templateParamReplaceSuffix)
      .match(templateWildcardOrParamRegex)
      ?.map(r => r.replace(templateWildcardOrParamPrefixRegex, '')) ?? []
  );
}

export interface PathParamsResult {
  params: Record<string, string>;
  wildcards: Record<string, string>;
}
export interface IMatcher {
  /**
   * Matches a path against the template
   * @param path
   * @param strict
   * @returns {boolean} whether the path matches the template
   */
  match: (path: string, strict?: boolean) => boolean;
  /**
   * Extracts params from a path
   * @param path
   * @returns {PathParamsResult} extracted params
   */
  extract: (path: string) => PathParamsResult;
}

export class Matcher<Name extends RouteName = RouteName> implements IMatcher {
  readonly #regex: RegExp;
  readonly #strictRegex: RegExp;

  readonly #template: string;
  readonly #params: string[];

  /**
   * Creates a new matcher
   * @param routeOrPath
   * @throws {MatcherInvalidPathError} when the path is invalid (empty or relative)
   */
  constructor(routeOrPath: string | Route<Name>) {
    const path = typeof routeOrPath === 'string' ? routeOrPath : routeOrPath.path;
    if (!path) throw new MatcherInvalidPathError(path);

    const { regex, strictRegex } = templateToRegex(path);
    this.#regex = regex;
    this.#strictRegex = strictRegex;

    this.#template = path;
    this.#params = templateToParams(path);
  }

  match(path: string, strict?: boolean): boolean {
    const _path = path?.trim()?.split('?')?.at(0)?.replace(hashPathRegex, '');
    if (!_path) return false;
    if (strict) return this.#strictRegex.test(_path);
    return this.#regex.test(_path);
  }

  extract(path: string): PathParamsResult {
    const _path = path?.trim()?.split('?')?.at(0)?.replace(hashPathRegex, '');
    const result: PathParamsResult = { params: {}, wildcards: {} };
    if (!_path) return result;
    this.#regex.exec(path)?.forEach((match, index) => {
      if (index === 0) return;
      if (index > this.#params.length) return;
      const paramName = this.#params[index - 1];
      if (paramName === '*') result.wildcards[index] = match;
      else result.params[paramName] = match;
    });
    return result;
  }
}
