import type { Route, RouteName, RouteNavigation } from '~/models/route.model.js';

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
}

type NavigationErrors = ErrorTypes.NAVIGATION_CANCELLED | ErrorTypes.NAVIGATION_ABORTED | ErrorTypes.NAVIGATION_NOT_FOUND;
export interface NavigationFailureType<Name extends RouteName = string> {
  /**
   * Type of the navigation. One of {@link ErrorTypes}
   */
  type: NavigationErrors;

  /**
   * Route location we were navigating to
   */
  to: RouteNavigation<Name>;

  /**
   * Route location we were navigating from
   */
  from?: Route<Name>;
}

export interface ErrorPayload<E = unknown> {
  message?: string;
  error?: E;
}

/**
 * Extended Error that contains extra information regarding a failed navigation.
 */
export class NavigationFailure<Name extends RouteName = string> extends Error implements NavigationFailureType<Name> {
  readonly type: NavigationErrors;
  readonly to: RouteNavigation<Name>;
  readonly from?: Route<Name>;
  readonly error?: unknown;

  constructor({ type, from, to }: NavigationFailureType<Name>, { message = `Navigation failed: ${type}`, error }: ErrorPayload = {}) {
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
export class NavigationAbortedError<Name extends RouteName = string, Error = unknown> extends NavigationFailure<Name> {
  declare readonly type: ErrorTypes.NAVIGATION_ABORTED;
  constructor(failure: Omit<NavigationFailureType<Name>, 'type'>, payload: ErrorPayload<Error> = {}) {
    super({ ...failure, type: ErrorTypes.NAVIGATION_ABORTED }, payload);
  }
}

/**
 * Error when a navigation is cancelled (a more recent navigation happened before the current one)
 */
export class NavigationCancelledError<Name extends RouteName = string, Error = unknown> extends NavigationFailure<Name> {
  declare readonly type: ErrorTypes.NAVIGATION_CANCELLED;
  constructor(failure: Omit<NavigationFailureType<Name>, 'type'>, payload: ErrorPayload<Error> = {}) {
    super({ ...failure, type: ErrorTypes.NAVIGATION_CANCELLED }, payload);
  }
}

/**
 * Error when a navigation is not found (no matching route)
 */
export class NavigationNotFoundError<Name extends RouteName = string, Error = unknown> extends NavigationFailure<Name> {
  declare readonly type: ErrorTypes.NAVIGATION_NOT_FOUND;
  constructor(failure: Omit<NavigationFailureType<Name>, 'type'>, payload: ErrorPayload<Error> = {}) {
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
export class RouterNameConflictError<Name extends RouteName = string> extends RouterConfigurationError<Name> {
  declare readonly type: ErrorTypes.ROUTER_CONFIG_NAME_CONFLICT;
  constructor(name: Name, message = `Route with name "${String(name)}" already exists`) {
    super(ErrorTypes.ROUTER_CONFIG_NAME_CONFLICT, { message, error: name });
  }
}

/**
 * Error when a route with the same path already exists
 */
export class RouterPathConflictError<Path extends Route['path'] = string> extends RouterConfigurationError<Path> {
  declare readonly type: ErrorTypes.ROUTER_CONFIG_PATH_CONFLICT;
  constructor(path: Path, message = `Route with path "${path}" already exists`) {
    super(ErrorTypes.ROUTER_CONFIG_PATH_CONFLICT, { message, error: path });
  }
}

type MisMatchErrorPayload<Name extends RouteName = string> = {
  name: Name;
  path: Route<Name>['path'];
  registeredName?: Name;
  registeredPath?: Route<Name>['path'];
};
export class RouterNamePathMismatchError<Name extends RouteName = string> extends RouterConfigurationError<MisMatchErrorPayload<Name>> {
  declare readonly type: ErrorTypes.ROUTER_CONFIG_NAME_PATH_MISMATCH;
  constructor(
    { name, path, registeredName, registeredPath }: MisMatchErrorPayload<Name>,
    message = `Route path "${path}" with name "${String(name)}" does not match registered${registeredName ? ` name "${String(registeredName)}"` : ''}${registeredPath ? ` path "${registeredPath}"` : ''}`,
  ) {
    super(ErrorTypes.ROUTER_CONFIG_NAME_PATH_MISMATCH, { message, error: { name, path, registeredName, registeredPath } });
  }
}
