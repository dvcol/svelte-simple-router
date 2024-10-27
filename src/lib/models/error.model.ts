import type { ResolvedRouteSnapshot } from '~/models/navigation.model.js';
import type { ResolvedRoute, Route, RouteName, RouteNavigation } from '~/models/route.model.js';
import type { ResolvedRouterLocationSnapshot } from '~/models/router.model.js';

/**
 * Flags so we can combine them when checking for multiple errors. This is the internal version of
 * {@link NavigationFailureType}.
 *
 * @internal
 */
export const enum ErrorTypes {
  /**
   * An aborted navigation is a navigation that failed because a navigation guard returned `false` or threw an error
   */
  NAVIGATION_ABORTED = 'NAVIGATION_ABORTED',
  /**
   * A cancelled navigation is a navigation that failed because a more recent navigation finished started (not necessarily finished).
   */
  NAVIGATION_CANCELLED = 'NAVIGATION_CANCELLED',
  /**
   * No route was found for the navigation location or name.
   */
  NAVIGATION_NOT_FOUND = 'NAVIGATION_NOT_FOUND',
  /**
   * The router already has a route with the same name.
   */
  ROUTER_CONFIG_NAME_CONFLICT = 'ROUTER_CONFIG_NAME_CONFLICT',
  /**
   * The router already has a route with the same path.
   */
  ROUTER_CONFIG_PATH_CONFLICT = 'ROUTER_CONFIG_PATH_CONFLICT',
  /**
   * The route path and name do not match.
   */
  ROUTER_CONFIG_NAME_PATH_MISMATCH = 'ROUTER_CONFIG_NAME_PATH_MISMATCH',
  /**
   * The provided path for a route is invalid and cannot be compiled into a valid regex.
   */
  MATCHER_INVALID_PATH = 'MATCHER_INVALID_PATH',
  /**
   * A required parameter is missing when parsing a path.
   */
  PARSING_MISSING_REQUIRED_PARAM = 'PARSING_MISSING_REQUIRED_PARAM',
  /**
   * Could not find a required router context.
   */
  MISSING_ROUTER_CONTEXT = 'MISSING_ROUTER_CONTEXT',
  /**
   * Could not find a required view context.
   */
  MISSING_VIEW_CONTEXT = 'MISSING_VIEW_CONTEXT',
  /**
   * No active event could be found when starting a view change.
   */
  VIEW_CHANGE_STATUS_ERROR = 'VIEW_CHANGE_STATUS_ERROR',
}

type NavigationErrors = ErrorTypes.NAVIGATION_CANCELLED | ErrorTypes.NAVIGATION_ABORTED | ErrorTypes.NAVIGATION_NOT_FOUND;
export interface NavigationFailureType<Name extends RouteName = RouteName> {
  /**
   * Route location we were navigating to
   */
  to: RouteNavigation<Name> | ResolvedRoute<Name> | ResolvedRouteSnapshot<Name>;
  /**
   * Route location we were navigating from
   */
  from?: Route<Name> | ResolvedRouterLocationSnapshot<Name>;
  /**
   * Unique identifier of the navigation event
   */
  uuid?: string;
}

export interface ErrorPayload<E = unknown> {
  message?: string;
  error?: E;
}

/**
 * Extended Error that contains extra information regarding a failed navigation.
 */
export class NavigationFailure<Name extends RouteName = RouteName> extends Error implements NavigationFailureType<Name> {
  readonly type: NavigationErrors;
  readonly to: NavigationFailureType<Name>['to'];
  readonly from?: NavigationFailureType<Name>['from'];
  readonly error?: unknown;

  constructor(
    { type, from, to }: NavigationFailureType<Name> & { type: NavigationErrors },
    { message = `Navigation failed: ${type}`, error }: ErrorPayload = {},
  ) {
    super(message);
    this.error = error;
    this.type = type;
    this.from = from;
    this.to = to;
  }
}

/**
 * Error when a navigation is aborted (a navigation guard returned `false` or threw an error)
 */
export class NavigationAbortedError<Name extends RouteName = RouteName, Error = unknown> extends NavigationFailure<Name> {
  declare readonly type: ErrorTypes.NAVIGATION_ABORTED;
  constructor(failure: NavigationFailureType<Name>, payload: ErrorPayload<Error> = {}) {
    super({ ...failure, type: ErrorTypes.NAVIGATION_ABORTED }, payload);
  }
}

/**
 * Error when a navigation is cancelled (a more recent navigation happened before the current one)
 */
export class NavigationCancelledError<Name extends RouteName = RouteName, Error = unknown> extends NavigationFailure<Name> {
  declare readonly type: ErrorTypes.NAVIGATION_CANCELLED;
  constructor(failure: NavigationFailureType<Name>, payload: ErrorPayload<Error> = {}) {
    super({ ...failure, type: ErrorTypes.NAVIGATION_CANCELLED }, payload);
  }
}

/**
 * Error when a navigation is not found (no matching route)
 */
export class NavigationNotFoundError<Name extends RouteName = RouteName, Error = unknown> extends NavigationFailure<Name> {
  declare readonly type: ErrorTypes.NAVIGATION_NOT_FOUND;
  constructor(failure: NavigationFailureType<Name>, payload: ErrorPayload<Error> = {}) {
    super({ ...failure, type: ErrorTypes.NAVIGATION_NOT_FOUND }, payload);
  }
}

type ConfigurationErrors =
  | ErrorTypes.ROUTER_CONFIG_NAME_CONFLICT
  | ErrorTypes.ROUTER_CONFIG_PATH_CONFLICT
  | ErrorTypes.ROUTER_CONFIG_NAME_PATH_MISMATCH;
export class RouterConfigurationError<E = unknown> extends Error {
  readonly type: ConfigurationErrors;
  readonly error?: E;

  constructor(type: ConfigurationErrors, { message = `Router Configuration error: ${type}`, error }: ErrorPayload<E>) {
    super(message);
    this.error = error;
    this.type = type;
  }
}

/**
 * Error when a route with the same name already exists
 */
export class RouterNameConflictError<Name extends RouteName = RouteName> extends RouterConfigurationError<Name> {
  declare readonly type: ErrorTypes.ROUTER_CONFIG_NAME_CONFLICT;
  constructor(name: Name, message = `A route with the name "${String(name)}" already exists`) {
    super(ErrorTypes.ROUTER_CONFIG_NAME_CONFLICT, { message, error: name });
  }
}

/**
 * Error when a route with the same path already exists
 */
export class RouterPathConflictError<Path extends Route['path'] = string> extends RouterConfigurationError<Path> {
  declare readonly type: ErrorTypes.ROUTER_CONFIG_PATH_CONFLICT;
  constructor(path: Path, message = `A route with the path "${path}" already exists`) {
    super(ErrorTypes.ROUTER_CONFIG_PATH_CONFLICT, { message, error: path });
  }
}

type MisMatchErrorPayload<Name extends RouteName = RouteName> = {
  name: Name;
  path: Route<Name>['path'];
  registeredName?: Name;
  registeredPath?: Route<Name>['path'];
};
export class RouterNamePathMismatchError<Name extends RouteName = RouteName> extends RouterConfigurationError<MisMatchErrorPayload<Name>> {
  declare readonly type: ErrorTypes.ROUTER_CONFIG_NAME_PATH_MISMATCH;
  constructor(
    { name, path, registeredName, registeredPath }: MisMatchErrorPayload<Name>,
    message = `Route path "${path}" with name "${String(name)}" does not match registered${registeredName ? ` name "${String(registeredName)}"` : ''}${registeredPath ? ` path "${registeredPath}"` : ''}`,
  ) {
    super(ErrorTypes.ROUTER_CONFIG_NAME_PATH_MISMATCH, { message, error: { name, path, registeredName, registeredPath } });
  }
}

type MatcherErrorTypes = ErrorTypes.MATCHER_INVALID_PATH;
export class MatcherError<E = unknown> extends Error {
  readonly type: MatcherErrorTypes;
  readonly error?: E;
  constructor(type: MatcherErrorTypes, error: E, message = `Matcher error: ${type}`) {
    super(message);
    this.type = type;
    this.error = error;
  }
}

export class MatcherInvalidPathError extends MatcherError<string> {
  declare readonly type: ErrorTypes.MATCHER_INVALID_PATH;
  constructor(path: string, message = `Invalid path "${path}"`) {
    super(ErrorTypes.MATCHER_INVALID_PATH, path, message);
  }
}

type ParsingErrorTypes = ErrorTypes.PARSING_MISSING_REQUIRED_PARAM;
export class ParsingError<E = unknown> extends Error {
  readonly type: ParsingErrorTypes;
  readonly error?: E;
  constructor(type: ParsingErrorTypes, error: E, message = `Parsing error: ${type}`) {
    super(message);
    this.type = type;
    this.error = error;
  }
}

type ParsingMissingRequiredParamPayload = { template: string; missing: string; params: Record<string, unknown> };
export class ParsingMissingRequiredParamError extends ParsingError<ParsingMissingRequiredParamPayload> {
  declare readonly type: ErrorTypes.PARSING_MISSING_REQUIRED_PARAM;
  constructor(
    { template, missing, params }: ParsingMissingRequiredParamPayload,
    message = `Missing required param "${missing}" while parsing path "${template}" .`,
  ) {
    super(ErrorTypes.PARSING_MISSING_REQUIRED_PARAM, { template, missing, params }, message);
  }
}

export class MissingRouterContextError extends Error {
  readonly type: ErrorTypes.MISSING_ROUTER_CONTEXT;
  constructor(message = 'Router context is missing. Make sure you are calling useRoutes inside a RouterContext or RouterView component tree.') {
    super(message);
    this.type = ErrorTypes.MISSING_ROUTER_CONTEXT;
  }
}

export class MissingViewContextError extends Error {
  readonly type: ErrorTypes.MISSING_VIEW_CONTEXT;
  constructor(message = 'View context is missing. Make sure you are calling useView inside a RouterView component tree.') {
    super(message);
    this.type = ErrorTypes.MISSING_VIEW_CONTEXT;
  }
}

export class ViewChangeStatusError extends Error {
  readonly type: ErrorTypes.VIEW_CHANGE_STATUS_ERROR;
  constructor(message = 'No active event could be found.') {
    super(message);
    this.type = ErrorTypes.VIEW_CHANGE_STATUS_ERROR;
  }
}
