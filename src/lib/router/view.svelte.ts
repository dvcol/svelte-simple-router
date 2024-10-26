import { randomHex } from '@dvcol/common-utils';
import { SvelteSet } from 'svelte/reactivity';

import { type LoadingErrorListener, LoadingEvent, type LoadingListener } from '~/models/navigation.model.js';

import { type BaseRoute, type RouteName } from '~/models/route.model.js';
import { DefaultView, type IView } from '~/models/view.model.js';

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
  readonly #log: string;

  /**
   * Indicates if the view is currently loading a component.
   * @private
   * @reactive
   */
  #loading = $state<LoadingEvent<Name>>();

  /**
   * Indicates if an error occurred during the last component loading.
   * @private
   * @reactive
   */
  #error = $state<Error | unknown>();

  /**
   * List of navigation guards that should be executed when the route changes and before the view change starts.
   * @reactive
   * @private
   */
  #onChangeListeners: Set<LoadingListener<Name>> = $state(new SvelteSet());

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
  #onErrorListeners: Set<LoadingErrorListener<Name>> = $state(new SvelteSet());

  /**
   * Indicates if the view is currently loading a component.
   * @reactive
   */
  get loading() {
    return !!this.#loading?.pending;
  }

  /**
   * Indicates if an error occurred during the last component loading.
   * @reactive
   */
  get error() {
    return this.#error;
  }

  constructor(name: string = DefaultView) {
    this.name = name;
    this.#log = `[${LoggerKey} View - ${this.id}${this.name ? ` - ${this.name}` : ''}]`;
  }

  /**
   * Add a listener that execute when the route changes and before the view change starts.
   *
   * @return Returns a function that removes the registered guard.
   *
   * @param listener - listener to add
   */
  onChange(listener: LoadingListener<Name>): () => void {
    this.#onChangeListeners.add(listener);
    return () => this.#onChangeListeners.delete(listener);
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
  onError(listener: LoadingErrorListener<Name>): () => void {
    this.#onErrorListeners.add(listener);
    return () => this.#onErrorListeners.delete(listener);
  }

  /**
   * Start the view loading process.
   * @param route
   */
  start(route?: BaseRoute<Name>) {
    const event = new LoadingEvent<Name>({ view: { id: this.id, name: this.name }, route });
    this.#loading = event;
    Logger.debug(this.#log, 'View resolving...', event);
    return Promise.all([...this.#onChangeListeners].map(listener => listener(event)));
  }

  /**
   * Mark the view as loading.
   */
  load() {
    if (!this.#loading) throw new Error('View not started');
    const event = this.#loading;
    event.load();
    Logger.debug(this.#log, 'View loading...', event);
    return Promise.all([...this.#onLoadingListeners].map(listener => listener(event)));
  }

  /**
   * Mark the view as loaded.
   */
  complete() {
    if (!this.#loading) throw new Error('View not started');
    const event = this.#loading;
    this.#error = undefined;
    this.#loading = undefined;
    event.complete();
    Logger.info(this.#log, 'View loaded', event);
    return Promise.all([...this.#onLoadedListeners].map(listener => listener(event)));
  }

  /**
   * Mark the view as failed to load.
   * @param error
   */
  fail(error: Error | unknown) {
    if (!this.#loading) throw new Error('View not started');
    const event = this.#loading;
    this.#error = error;
    this.#loading = undefined;
    event.fail(error);
    Logger.error(this.#log, 'View failed to load', { error, event });
    return Promise.all([...this.#onErrorListeners].map(listener => listener(error, event)));
  }
}
