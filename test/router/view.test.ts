import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ViewChangeStatusError } from '~/models/error.model.js';
import { DefaultView } from '~/models/view.model.js';
import { ViewChangeEvent } from '~/router/event.svelte.js';
import { View } from '~/router/view.svelte.js';
import { Logger } from '~/utils/logger.utils.js';

describe('view', () => {
  const routerId = 'router-id';
  const route = { name: 'route-name', path: '/route-path' };

  describe('constructor', () => {
    it('should create a new view instance with default name', () => {
      expect.assertions(4);
      const view = new View(routerId);

      expect(view.id).toBe(`${routerId}-${view.uuid}-${DefaultView}`);
      expect(view.name).toBe(DefaultView);

      expect(view.loading).toBeFalsy();
      expect(view.error).toBeUndefined();
    });

    it('should create a new view instance with provided name', () => {
      expect.assertions(4);
      const name = 'view-name';
      const view = new View(routerId, name);

      expect(view.id).toBe(`${routerId}-${view.uuid}-${name}`);
      expect(view.name).toBe(name);

      expect(view.loading).toBeFalsy();
      expect(view.error).toBeUndefined();
    });
  });

  describe('hooks', () => {
    let view: View;
    let change: ViewChangeEvent;

    beforeEach(() => {
      view = new View(routerId);
      change = new ViewChangeEvent({ view, route });
    });

    describe('onChange', () => {
      it('should add a listener that execute when the view starts', async () => {
        expect.assertions(5);

        const listener = vi.fn();
        view.onChange(listener);

        expect(listener).not.toHaveBeenCalled();
        expect(view.loading).toBeFalsy();

        await view.start(change);

        expect(view.loading).toBeTruthy();
        expect(view.error).toBeUndefined();

        expect(listener).toHaveBeenCalledTimes(1);
      });

      it('should remove listener when calling the callback', async () => {
        expect.assertions(4);

        const listener = vi.fn();
        const unsub = view.onChange(listener);

        expect(listener).not.toHaveBeenCalled();
        unsub();

        await view.start(change);

        expect(view.loading).toBeTruthy();
        expect(view.error).toBeUndefined();

        expect(listener).not.toHaveBeenCalled();
      });
    });

    describe('onLoading', () => {
      it('should add a listener that is executed when a view start loading a component', async () => {
        expect.assertions(4);

        const listener = vi.fn();
        view.onLoading(listener);

        await view.start(change);
        expect(listener).not.toHaveBeenCalled();
        await view.load();

        expect(view.loading).toBeTruthy();
        expect(view.error).toBeUndefined();

        expect(listener).toHaveBeenCalledTimes(1);
      });

      it('should remove listener when calling the callback', async () => {
        expect.assertions(4);

        const listener = vi.fn();
        const unsub = view.onLoading(listener);

        await view.start(change);
        expect(listener).not.toHaveBeenCalled();
        unsub();
        await view.load();

        expect(view.loading).toBeTruthy();
        expect(view.error).toBeUndefined();

        expect(listener).not.toHaveBeenCalled();
      });

      it('should throw an error if the view is not loading', () => {
        expect.assertions(5);

        const listener = vi.fn();
        view.onLoading(listener);

        expect(listener).not.toHaveBeenCalled();
        expect((): undefined => view.load()).toThrow(ViewChangeStatusError);

        expect(view.loading).toBeFalsy();
        expect(view.error).toBeUndefined();

        expect(listener).not.toHaveBeenCalled();
      });
    });

    describe('onLoaded', () => {
      it('should add a listener that is executed when a view start loading a component', async () => {
        expect.assertions(4);

        const listener = vi.fn();
        view.onLoaded(listener);

        await view.start(change);
        expect(listener).not.toHaveBeenCalled();
        await view.complete();

        expect(view.loading).toBeFalsy();
        expect(view.error).toBeUndefined();

        expect(listener).toHaveBeenCalledTimes(1);
      });

      it('should remove listener when calling the callback', async () => {
        expect.assertions(4);

        const listener = vi.fn();
        const unsub = view.onLoaded(listener);

        await view.start(change);
        expect(listener).not.toHaveBeenCalled();
        unsub();
        await view.complete();

        expect(view.loading).toBeFalsy();
        expect(view.error).toBeUndefined();

        expect(listener).not.toHaveBeenCalled();
      });

      it('should throw an error if the view is not loading', () => {
        expect.assertions(5);

        const listener = vi.fn();
        view.onLoaded(listener);

        expect(listener).not.toHaveBeenCalled();
        expect((): undefined => view.complete()).toThrow(ViewChangeStatusError);

        expect(view.loading).toBeFalsy();
        expect(view.error).toBeUndefined();

        expect(listener).not.toHaveBeenCalled();
      });
    });

    describe('onError', () => {
      const error = new Error('my-custom-error');

      it('should add a listener that is executed when an error occurs during view loading', async () => {
        expect.assertions(4);

        const listener = vi.fn();
        view.onError(listener);

        await view.start(change);
        expect(listener).not.toHaveBeenCalled();
        await view.fail(error);

        expect(view.loading).toBeFalsy();
        expect(view.error).toBe(error);

        expect(listener).toHaveBeenCalledTimes(1);
      });

      it('should remove listener when calling the callback', async () => {
        expect.assertions(4);

        const listener = vi.fn();
        const unsub = view.onError(listener);

        await view.start(change);
        expect(listener).not.toHaveBeenCalled();
        unsub();
        await view.fail(error);

        expect(view.loading).toBeFalsy();
        expect(view.error).toBe(error);

        expect(listener).not.toHaveBeenCalled();
      });

      it('should throw an error if the view is not loading', () => {
        expect.assertions(5);

        const listener = vi.fn();
        view.onError(listener);

        expect(listener).not.toHaveBeenCalled();
        expect((): undefined => view.fail(error)).toThrow(ViewChangeStatusError);

        expect(view.loading).toBeFalsy();
        expect(view.error).toBeUndefined();

        expect(listener).not.toHaveBeenCalled();
      });
    });
  });

  describe('viewChangeEvent', () => {
    const log = vi.spyOn(Logger.logger, 'error').mockReturnValue(undefined);
    const view = new View(routerId);

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should create a new ViewChangeEvent instance with provided view and route and view.pending should be true', () => {
      expect.assertions(9);

      const event = new ViewChangeEvent({ view, route });

      expect(event.uuid).toBeDefined();
      expect(event.view).toBe(view);
      expect(event.route).toBe(route);

      expect(event.error).toBeUndefined();
      expect(event.status).toBe('pending');
      expect(event.loading).toBeFalsy();
      expect(event.pending).toBeTruthy();
      expect(event.loaded).toBeFalsy();
      expect(event.failed).toBeFalsy();
    });

    describe('load', () => {
      it('should mark the view event as loading when load is called and view.loading and view.pending should be true', () => {
        expect.assertions(4);

        const event = new ViewChangeEvent({ view, route });

        expect(event.loading).toBeFalsy();
        expect(event.pending).toBeTruthy();

        event.load();

        expect(event.loading).toBeTruthy();
        expect(event.pending).toBeTruthy();
      });

      it('should log an error if the view event is already loading', () => {
        expect.assertions(5);

        const event = new ViewChangeEvent({ view, route });
        event.complete();

        expect(event.loading).toBeFalsy();
        expect(event.pending).toBeFalsy();
        expect(log).not.toHaveBeenCalled();

        event.load();

        expect(log).toHaveBeenCalledTimes(1);
        expect(log).toHaveBeenCalledWith('Cannot load a change event that is not pending', event);
      });
    });

    describe('complete', () => {
      it('should mark the view event as loaded when complete is called and view.loaded should be true', () => {
        expect.assertions(4);

        const event = new ViewChangeEvent({ view, route });

        expect(event.loaded).toBeFalsy();
        expect(event.pending).toBeTruthy();

        event.complete();

        expect(event.loaded).toBeTruthy();
        expect(event.pending).toBeFalsy();
      });

      it('should log an error if the view event is not pending', () => {
        expect.assertions(5);

        const event = new ViewChangeEvent({ view, route });
        event.complete();

        expect(event.loaded).toBeTruthy();
        expect(event.pending).toBeFalsy();
        expect(log).not.toHaveBeenCalled();

        event.complete();

        expect(log).toHaveBeenCalledTimes(1);
        expect(log).toHaveBeenCalledWith('Cannot complete a change event that is not pending', event);
      });
    });

    describe('error', () => {
      const error = new Error('my-custom-error');

      it('should mark the view event as errored when error is called, view.error should be defined and view.failed should be true', () => {
        expect.assertions(5);

        const event = new ViewChangeEvent({ view, route });

        expect(event.error).toBeUndefined();
        expect(event.failed).toBeFalsy();

        event.fail(error);

        expect(event.error).toBe(error);
        expect(event.failed).toBeTruthy();
        expect(event.pending).toBeFalsy();
      });

      it('should log an error if the view event is not pending', () => {
        expect.assertions(7);

        const event = new ViewChangeEvent({ view, route });
        event.complete();

        expect(event.loaded).toBeTruthy();
        expect(event.pending).toBeFalsy();
        expect(log).not.toHaveBeenCalled();

        event.fail(error);

        expect(event.failed).toBeFalsy();
        expect(event.error).toBeUndefined();

        expect(log).toHaveBeenCalledTimes(1);
        expect(log).toHaveBeenCalledWith('Cannot fail a change event that is not pending', event);
      });
    });

    describe('result', () => {
      const error = new Error('my-custom-error');
      const resolverSpy = vi.spyOn(Promise, 'withResolvers');
      const resolveSpy = vi.spyOn(Promise, 'resolve');
      const rejectSpy = vi.spyOn(Promise, 'reject');

      it('should return the result of the view event if the event is already resolved', async () => {
        expect.assertions(4);

        const event = new ViewChangeEvent({ view, route });
        event.complete();

        await expect(event.result).resolves.toBe('loaded');

        expect(resolverSpy).not.toHaveBeenCalled();
        expect(rejectSpy).not.toHaveBeenCalled();
        expect(resolveSpy).toHaveBeenCalledWith('loaded');
      });

      it('should return a rejected promise if the event is failed', async () => {
        expect.assertions(3);

        const event = new ViewChangeEvent({ view, route });
        event.fail(error);

        await expect(event.result).rejects.toBe('error');

        expect(resolverSpy).not.toHaveBeenCalled();
        expect(rejectSpy).toHaveBeenCalledWith('error');
      });

      it('should return a pending promise if the event is pending', async () => {
        expect.assertions(3);

        const event = new ViewChangeEvent({ view, route });

        const promise = event.result;

        expect(promise).toBeInstanceOf(Promise);
        expect(resolverSpy).toHaveBeenCalledTimes(1);
        event.complete();

        await expect(promise).resolves.toBe('loaded');
      });
    });
  });
});
