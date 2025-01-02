import type {
  INavigationEvent,
  IViewChangeEvent,
  NavigationEventStatus,
  ResolvedRouteSnapshot,
  ViewChangeEventStatus,
} from '~/models/navigation.model.js';
import type { BaseRoute, ResolvedRoute, RouteName, RouteNavigation } from '~/models/route.model.js';

import type { ResolvedRouterLocationSnapshot, RouterNavigationOptions } from '~/models/router.model.js';
import type { IView } from '~/models/view.model.js';

import { NavigationAbortedError, NavigationCancelledError } from '~/models/error.model.js';
import { toBaseRoute } from '~/models/route.model.js';
import { Logger } from '~/utils/logger.utils.js';

export class NavigationEvent<Name extends RouteName = RouteName> implements INavigationEvent<Name> {
  readonly uuid: string;
  readonly to: ResolvedRouteSnapshot<Name>;
  readonly from: ResolvedRouterLocationSnapshot<Name>;
  readonly options: RouterNavigationOptions;

  #result?: Promise<NavigationEventStatus>;
  #resolve?: (status: NavigationEventStatus) => void;
  #reject?: (error: unknown) => void;

  #status: NavigationEventStatus = $state('active');
  #error?: unknown;
  #redirect?: RouteNavigation<Name>;

  /**
   * The error that caused the navigation to fail if any.
   */
  get error(): unknown {
    return this.#error;
  }

  /**
   * The current status of the navigation event.
   */
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

  constructor(to: ResolvedRoute<Name>, from: ResolvedRouterLocationSnapshot<Name>, options: RouterNavigationOptions = {}) {
    this.uuid = crypto.randomUUID();
    this.to = { ...to, route: toBaseRoute(to.route)! };
    this.from = from;
    this.options = { ...options };
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
    this.#error = error ?? new NavigationCancelledError(this);
    this.#reject?.(this.#status);
    if (this.#error instanceof NavigationCancelledError) throw this.#error;
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
    this.#error = error ?? new NavigationAbortedError(this);
    this.#reject?.(this.#status);
    if (this.#error instanceof NavigationAbortedError) throw this.#error;
    throw new NavigationAbortedError(this, { error });
  }
}

export class ViewChangeEvent<Name extends RouteName = RouteName> implements IViewChangeEvent<Name> {
  readonly uuid: string;
  readonly view: Pick<IView<Name>, 'id' | 'name'>;
  readonly route?: BaseRoute<Name>;

  #result?: Promise<ViewChangeEventStatus>;
  #resolve?: (status: ViewChangeEventStatus) => void;
  #reject?: (error: unknown) => void;

  #status: ViewChangeEventStatus = $state('pending');
  #error?: unknown;

  get error(): unknown {
    return this.#error;
  }

  get status(): ViewChangeEventStatus {
    return this.#status;
  }

  get loading(): boolean {
    return this.#status === 'loading';
  }

  get pending(): boolean {
    return this.loading || this.#status === 'pending';
  }

  get loaded(): boolean {
    return this.#status === 'loaded';
  }

  get failed(): boolean {
    return this.#status === 'error';
  }

  /**
   * Promise that resolves when the navigation event is completed.
   */
  get result(): Promise<ViewChangeEventStatus> {
    if (!this.pending) return this.failed ? Promise.reject(this.#status) : Promise.resolve(this.#status);
    if (!this.#result) {
      const { promise, resolve, reject } = Promise.withResolvers<ViewChangeEventStatus>();
      this.#result = promise;
      this.#resolve = resolve;
      this.#reject = reject;
    }
    return this.#result;
  }

  constructor({ view, route }: Pick<IViewChangeEvent<Name>, 'view' | 'route'>) {
    this.uuid = crypto.randomUUID();
    this.view = view;
    this.route = route;
  }

  load(): this {
    if (!this.pending) return Logger.error('Cannot load a change event that is not pending', this);
    this.#status = 'loading';
    return this;
  }

  complete(): this {
    if (!this.pending) return Logger.error('Cannot complete a change event that is not pending', this);
    this.#status = 'loaded';
    this.#resolve?.(this.#status);
    return this;
  }

  fail(error?: unknown): this {
    if (!this.pending) return Logger.error('Cannot fail a change event that is not pending', this);
    this.#status = 'error';
    this.#error = error;
    this.#reject?.(error);
    return this;
  }
}
