import { randomHex } from '@dvcol/common-utils';
import { SvelteSet } from 'svelte/reactivity';

import type { LoadingListener, NavigationErrorListener } from '~/models/navigation.model.js';
import type { IView } from '~/models/view.model.js';

import { type BaseRoute, type RouteName } from '~/models/route.model.js';

import { Logger, LoggerKey } from '~/utils/logger.utils.js';

export class View<Name extends RouteName = RouteName> implements IView<Name> {
  /**
   * Unique identifier for the router instance.
   */
  readonly id = `v${randomHex(4)}`;

  /**
   * Name of the router view instance this is attached to.
   */
  readonly name?: string;

  /**
   * Logger prefix for the router instance.
   * @private
   */
  readonly #log = `[${LoggerKey} View - ${this.id}${this.name ? ` ${this.name}` : ''}]`;

  /**
   * Indicates if the view is currently loading a component.
   * @private
   * @reactive
   */
  #loading = $state(false);

  /**
   * Indicates if an error occurred during the last component loading.
   * @private
   * @reactive
   */
  #error = $state<Error | unknown>();

  /**
   * List of listeners that should be executed when a view start loading a component.
   * @reactive
   * @private
   */
  #onLoadingListeners: Set<LoadingListener<Name>> = $state(new SvelteSet());

  /**
   * List of listeners that should be executed when a view load a component.
   * @reactive
   * @private
   */
  #onLoadedListeners: Set<LoadingListener<Name>> = $state(new SvelteSet());

  /**
   * List of listeners that should be executed when an error occurs during view loading.
   * @reactive
   * @private
   */
  #onErrorListeners: Set<NavigationErrorListener<Name>> = $state(new SvelteSet());

  /**
   * Indicates if the view is currently loading a component.
   * @reactive
   */
  get loading() {
    return this.#loading;
  }

  /**
   * Indicates if an error occurred during the last component loading.
   * @reactive
   */
  get error() {
    return this.#error;
  }

  constructor(name: string = 'default') {
    this.name = name;
  }

  /**
   * Add a listener that is executed when a view start loading a component.
   *
   * @param listener - listener to add
   *
   * @returns a function that removes the registered listener
   */
  onLoading(listener: LoadingListener<Name>): () => void {
    this.#onLoadingListeners.add(listener);
    return () => this.#onLoadingListeners.delete(listener);
  }

  /**
   * Add a listener that is executed when a view start loading a component.
   *
   * @param listener - listener to add
   *
   * @returns a function that removes the registered listener
   */
  onLoaded(listener: LoadingListener<Name>): () => void {
    this.#onLoadedListeners.add(listener);
    return () => this.#onLoadedListeners.delete(listener);
  }

  /**
   * Add a listener that is executed when an error occurs during view loading.
   *
   * @param listener - listener to add
   *
   * @returns a function that removes the registered listener
   */
  onError(listener: NavigationErrorListener<Name>): () => void {
    this.#onErrorListeners.add(listener);
    return () => this.#onErrorListeners.delete(listener);
  }

  /**
   * Mark the view as loading.
   * @param route
   */
  isLoading(route?: BaseRoute<Name>) {
    this.#loading = true;
    this.#onLoadingListeners.forEach(listener => listener(route));
    Logger.debug(this.#log, 'Route loading...', route);
  }

  /**
   * Mark the view as loaded.
   * @param route
   */
  hasLoaded(route?: BaseRoute<Name>) {
    this.#error = undefined;
    this.#loading = false;
    this.#onLoadedListeners.forEach(listener => listener(route));
    Logger.debug(this.#log, 'Route loaded', route);
  }

  /**
   * Mark the view as failed to load.
   * @param error
   * @param route
   */
  hasError(error: Error | unknown, route?: BaseRoute<Name>) {
    this.#error = error;
    this.#loading = false;
    this.#onErrorListeners.forEach(listener => listener(error, { route }));
    Logger.error(this.#log, 'Fail to load', { error, route });
  }
}
