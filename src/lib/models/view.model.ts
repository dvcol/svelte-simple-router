import type { LoadingListener, NavigationErrorListener } from '~/models/navigation.model.js';
import type { RouteName } from '~/models/route.model.js';

export type IView<Name extends RouteName = RouteName> = {
  /**
   * Unique identifier of the router instance.
   */
  readonly id: string;

  /**
   * Name of the router view instance this is attached to.
   */
  name?: string;

  /**
   * Indicates if the view is currently loading a component.
   */
  loading: boolean;

  /**
   * Indicates if an error occurred during the last component loading.
   * When a new loading starts, the error state is reset to `undefined`.
   */
  error?: Error | unknown;

  /**
   * Add a listener that is executed when a view start loading a component.
   *
   * @param listener - listener to add
   *
   * @returns a function that removes the registered listener
   */
  onLoading(listener: LoadingListener<Name>): () => void;

  /**
   * Add a listener that is executed when a view start loading a component.
   *
   * @param listener - listener to add
   *
   * @returns a function that removes the registered listener
   */
  onLoaded(listener: LoadingListener<Name>): () => void;

  /**
   * Add a listener that is executed when an error occurs during view loading.
   *
   * @param listener - listener to add
   *
   * @returns a function that removes the registered listener
   */
  onError(listener: NavigationErrorListener<Name>): () => void;
};
