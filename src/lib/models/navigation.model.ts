import type { BaseRoute, ResolvedRoute, RouteName, RouteNavigation } from '~/models/route.model.js';
import type { ResolvedRouterLocationSnapshot, ResolvedRouteSnapshot } from '~/models/router.model.js';

import { NavigationAbortedError, NavigationCancelledError } from '~/models/error.model.js';
import { toBaseRoute } from '~/models/route.model.js';
import { Logger } from '~/utils/index.js';

export type INavigationEventState<Name extends RouteName = RouteName> = {
  readonly active: boolean;
  readonly failed: boolean | unknown;
  readonly cancelled: boolean;
  readonly completed: boolean;
  readonly redirected: boolean | RouteNavigation<Name>;
};

export type INavigationEvent<Name extends RouteName = RouteName> = INavigationEventState<Name> & {
  readonly to: ResolvedRouteSnapshot<Name>;
  readonly from: ResolvedRouterLocationSnapshot<Name>;
  readonly uuid: string;
  readonly result: Promise<NavigationEventStatus>;
  readonly status: NavigationEventStatus;
};

type NavigationEventStatus = keyof INavigationEventState;

export class NavigationEvent<Name extends RouteName = RouteName> implements INavigationEvent<Name> {
  readonly to: ResolvedRouteSnapshot<Name>;
  readonly from: ResolvedRouterLocationSnapshot<Name>;
  readonly uuid: string;

  #result?: Promise<NavigationEventStatus>;
  #resolve?: (status: NavigationEventStatus) => void;
  #reject?: (error: unknown) => void;

  #status: NavigationEventStatus = 'active';
  #error?: unknown;
  #redirect?: RouteNavigation<Name>;

  get status(): NavigationEventStatus {
    return this.#status;
  }

  /**
   * The navigation event is still pending.
   * @pending
   */
  get active(): boolean {
    return this.#status === 'active';
  }

  /**
   * The navigation has been completed successfully.
   * @success
   */
  get completed(): boolean {
    return this.#status === 'completed';
  }

  /**
   * The navigation has been cancelled.
   * @error
   */
  get cancelled(): boolean {
    return this.#status === 'cancelled';
  }

  /**
   * The navigation has failed.
   * @error
   */
  get failed(): unknown | boolean {
    return this.#error ?? this.#status === 'failed';
  }

  /**
   * The navigation has been redirected.
   * @success
   */
  get redirected(): RouteNavigation<Name> | boolean {
    return this.#redirect ?? this.#status === 'redirected';
  }

  /**
   * Promise that resolves when the navigation event is completed.
   */
  get result(): Promise<NavigationEventStatus> {
    if (!this.active) return this.completed || this.redirected ? Promise.resolve(this.#status) : Promise.reject(this.#status);
    if (!this.#result) {
      const { promise, resolve, reject } = Promise.withResolvers<NavigationEventStatus>();
      this.#result = promise;
      this.#resolve = resolve;
      this.#reject = reject;
    }
    return this.#result;
  }

  constructor(to: ResolvedRoute<Name>, from: ResolvedRouterLocationSnapshot<Name>) {
    this.uuid = crypto.randomUUID();
    this.to = { ...to, route: toBaseRoute(to.route)! };
    this.from = from;
  }

  /**
   * Complete the current navigation event and mark it as redirected.
   * @param to
   */
  redirect(to: RouteNavigation<Name>): void {
    if (!this.active) return Logger.error('Cannot redirect a navigation event that is not active', this);
    this.#status = 'redirected';
    this.#redirect = to;
    this.#resolve?.(this.#status);
  }

  /**
   * Complete the current navigation event and mark it as completed.
   */
  complete(): void {
    if (!this.active) return Logger.error('Cannot complete a navigation event that is not active', this);
    this.#status = 'completed';
    this.#resolve?.(this.#status);
  }

  /**
   * Cancel the current navigation event.
   * @throws {@link NavigationCancelledError}
   */
  cancel(error?: unknown): void {
    if (!this.active) return Logger.error('Cannot cancel a navigation event that is not active', this);
    this.#status = 'cancelled';
    this.#error = error;
    this.#reject?.(this.#status);
    if (error instanceof NavigationCancelledError) throw error;
    throw new NavigationCancelledError(this, { error });
  }

  /**
   * Fail the current navigation event.
   * @param error - Error to throw
   * @throws {@link NavigationAbortedError}
   */
  fail(error?: unknown): void {
    if (!this.active) return Logger.error('Cannot fail a navigation event that is not active', this);
    this.#status = 'failed';
    this.#error = error;
    this.#reject?.(this.#status);
    if (error instanceof NavigationAbortedError) throw error;
    throw new NavigationAbortedError(this, { error });
  }
}

export type NavigationListener<Name extends RouteName = RouteName> = (navigation: INavigationEvent<Name>) => void;

export type NavigationEndListener<Name extends RouteName = RouteName> = (
  navigation: INavigationEvent<Name>,
  resolved: ResolvedRouterLocationSnapshot<Name>,
) => void;

export type NavigationErrorListener<Name extends RouteName = RouteName> = (
  navigation: Error | unknown,
  context: Partial<INavigationEvent<Name>> & { route?: BaseRoute<Name> },
) => void;

export type LoadingListener<Name extends RouteName = RouteName> = (route?: BaseRoute<Name>) => void;
