import type { BaseRoute, ResolvedRoute, RouteName, RouteNavigation } from '~/models/route.model.js';

import type { ResolvedRouterLocationSnapshot, RouterNavigationOptions } from '~/models/router.model.js';

import type { IView } from '~/models/view.model.js';

export type ResolveGuardReturn = void | undefined | null | boolean | string | Error;
export type NavigationGuardReturn<Name extends RouteName = RouteName> = ResolveGuardReturn | RouteNavigation<Name>;

/**
 * Navigation guards trigger after url change and before the route component is rendered.
 * If a guard returns `false`, and object of instance `Error` or `throws`, the navigation will be aborted and the error will be thrown.
 * If a guard returns an object with a `path` or `name` property, the navigation will be redirected to the provided route, if any is found and `followGuardRedirects` is enabled.
 */
export type NavigationGuard<Name extends RouteName = RouteName> = (
  navigation: INavigationEvent<Name>,
) => NavigationGuardReturn<Name> | Promise<NavigationGuardReturn<Name>>;

/**
 * Resolve guards trigger before url change and before the target route is resolved.
 */
export type ResolveGuard<Name extends RouteName = RouteName> = (resolved: ResolvedRoute<Name>) => ResolveGuardReturn | Promise<ResolveGuardReturn>;

export type INavigationEventState<Name extends RouteName = RouteName> = {
  readonly active: boolean;
  readonly failed: boolean | unknown;
  readonly cancelled: boolean;
  readonly completed: boolean;
  readonly redirected: boolean | RouteNavigation<Name>;
};

export type ResolvedRouteSnapshot<Name extends RouteName = RouteName> = Omit<ResolvedRoute<Name>, 'route'> & {
  route: BaseRoute<Name>;
};

export type INavigationEvent<Name extends RouteName = RouteName> = INavigationEventState<Name> & {
  /**
   * Unique identifier of the router instance.
   */
  readonly uuid: string;
  /**
   * Source of the navigation event.
   */
  readonly to: ResolvedRouteSnapshot<Name>;
  /**
   * Destination of the navigation event.
   */
  readonly from: ResolvedRouterLocationSnapshot<Name>;
  /**
   * The error that caused the navigation to fail if any.
   */
  readonly error?: unknown;
  /**
   * Promise that resolves when the navigation event is completed.
   */
  readonly result: Promise<NavigationEventStatus>;
  /**
   * The current status of the navigation event.
   */
  readonly status: NavigationEventStatus;
  /**
   * Optional navigation options.
   */
  readonly options: RouterNavigationOptions;
};

export type NavigationEventStatus = keyof INavigationEventState;

export type NavigationListener<Name extends RouteName = RouteName> = (navigation: INavigationEvent<Name>) => void | Promise<void>;

export type NavigationEndListener<Name extends RouteName = RouteName> = (
  navigation: INavigationEvent<Name>,
  resolved: ResolvedRouterLocationSnapshot<Name>,
) => void | Promise<void>;

export type NavigationErrorListener<Name extends RouteName = RouteName> = (
  error: Error | unknown,
  event: INavigationEvent<Name>,
) => void | Promise<void>;

export type ViewChangeEventStatus = 'pending' | 'loading' | 'loaded' | 'error';
export type IViewChangeEvent<Name extends RouteName = RouteName> = {
  /**
   * Unique identifier of the router instance.
   */
  readonly uuid: string;
  /**
   * View that is currently loading.
   */
  readonly view: Pick<IView<Name>, 'id' | 'name'>;
  /**
   * Route that is currently loading.
   */
  readonly route?: BaseRoute<Name>;
  /**
   * The error that caused the loading to fail if any.
   */
  readonly error?: unknown;
  /**
   * The current status of the loading event.
   */
  readonly status: ViewChangeEventStatus;
  /**
   * Indicates if the loading event status is currently pending or loading.
   */
  readonly pending: boolean;
  /**
   * Indicates if the loading event is currently loading an async component.
   */
  readonly loading: boolean;
  /**
   * Indicates if the loading event has been completed.
   */
  readonly loaded: boolean;
  /**
   * Indicates if the loading event has failed.
   */
  readonly failed: boolean;
  /**
   * Promise that resolves when the loading event is completed.
   */
  readonly result: Promise<ViewChangeEventStatus>;
};

export type ViewChangeListener<Name extends RouteName = RouteName> = (event: IViewChangeEvent<Name>) => void | Promise<void>;
export type LoadingErrorListener<Name extends RouteName = RouteName> = (
  error: Error | unknown,
  event: IViewChangeEvent<Name>,
) => void | Promise<void>;

export type ErrorListener<Name extends RouteName = RouteName> = (
  error: Error | unknown,
  event: INavigationEvent<Name> | IViewChangeEvent<Name>,
) => void | Promise<void>;
