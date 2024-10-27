import { randomHex } from '@dvcol/common-utils';
import { SvelteSet } from 'svelte/reactivity';

import type { LoadingErrorListener, ViewChangeListener } from '~/models/navigation.model.js';
import type { ViewChangeEvent } from '~/router/event.svelte.js';

import { ViewChangeStatusError } from '~/models/error.model.js';

import { type RouteName } from '~/models/route.model.js';
import { DefaultView, type IDefaultView, type IView } from '~/models/view.model.js';

import { Logger, LoggerColor, LoggerKey } from '~/utils/logger.utils.js';

export class View<Name extends RouteName = RouteName> implements IView<Name> {
  /**
   * Unique identifier for the view instance.
   */
  readonly uuid = `v${randomHex(4)}`;

  /**
   * Unique identifier for the router instance.
   */
  readonly routerId: string;

  /**
   * Name of the router view instance this is attached to.
   */
  readonly name: IDefaultView | Name;

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
  #loading = $state<ViewChangeEvent<Name>>();

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
  #onChangeListeners: Set<ViewChangeListener<Name>> = $state(new SvelteSet());

  /**
   * List of listeners that should be executed when a view start loading a component.
   * @reactive
   * @private
   */
  #onViewChangeListeners: Set<ViewChangeListener<Name>> = $state(new SvelteSet());

  /**
   * List of listeners that should be executed when a view load a component.
   * @reactive
   * @private
   */
  #onLoadedListeners: Set<ViewChangeListener<Name>> = $state(new SvelteSet());

  /**
   * List of listeners that should be executed when an error occurs during view loading.
   * @reactive
   * @private
   */
  #onErrorListeners: Set<LoadingErrorListener<Name>> = $state(new SvelteSet());

  /**
   * Unique identifier of the view instance.
   */
  get id() {
    return `${this.routerId}-${this.uuid}-${String(this.name)}`;
  }

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

  constructor(routerId: string, name: IDefaultView | Name = DefaultView) {
    this.routerId = routerId;
    this.name = name;
    this.#log = `[${LoggerKey} View - ${[this.routerId, this.uuid, this.name].join(' - ')}]`;
  }

  /**
   * Add a listener that execute when the route changes and before the view change starts.
   *
   * @return Returns a function that removes the registered guard.
   *
   * @param listener - listener to add
   */
  onChange(listener: ViewChangeListener<Name>): () => void {
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
  onLoading(listener: ViewChangeListener<Name>): () => void {
    this.#onViewChangeListeners.add(listener);
    return () => this.#onViewChangeListeners.delete(listener);
  }

  /**
   * Add a listener that is executed when a view start loading a component.
   *
   * @param listener - listener to add
   *
   * @returns a function that removes the registered listener
   */
  onLoaded(listener: ViewChangeListener<Name>): () => void {
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
   * @param event
   */
  start(event: ViewChangeEvent<Name>) {
    this.#loading = event;
    Logger.debug(this.#log, 'View resolving...', event);
    return Promise.all([...this.#onChangeListeners].map(listener => listener(event)));
  }

  /**
   * Mark the view as loading.
   * @param event
   */
  load(event = this.#loading) {
    if (!event) throw new ViewChangeStatusError();
    event.load();
    Logger.debug(this.#log, 'View loading...', event);
    return Promise.all([...this.#onViewChangeListeners].map(listener => listener(event)));
  }

  /**
   * Mark the view as loaded.
   * @param event
   */
  complete(event = this.#loading) {
    if (!event) throw new ViewChangeStatusError();
    this.#error = undefined;
    this.#loading = undefined;
    event.complete();
    Logger.info(...Logger.colorize(LoggerColor.Success, this.#log, 'View loaded'), event);
    return Promise.all([...this.#onLoadedListeners].map(listener => listener(event)));
  }

  /**
   * Mark the view as failed to load.
   * @param error
   * @param event
   */
  fail(error: Error | unknown, event = this.#loading) {
    if (!event) throw new ViewChangeStatusError();
    this.#error = error;
    this.#loading = undefined;
    event.fail(error);
    Logger.error(this.#log, 'View failed to load', { error, event });
    return Promise.all([...this.#onErrorListeners].map(listener => listener(error, event)));
  }
}
