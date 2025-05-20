<h1 align="center">Welcome to <i>Svelte Simple Router</i></h1>
<h3 align="center">A simple and flexible SPA router for svelte 5</h3>

<p>
  <img src="https://img.shields.io/badge/pnpm-%3E%3D8.0.0-blue.svg" />
  <img src="https://img.shields.io/badge/node-%3E%3D20.0.0-blue.svg" />
  <a href="https://github.com/dvcol/svelte-simple-router#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/dvcol/svelte-simple-router/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/dvcol/svelte-simple-router/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/dvcol/svelte-simple-router" />
  </a>
 <a href="https://paypal.me/dvcol/5" target="_blank">
    <img alt="donate" src="https://img.shields.io/badge/Donate%20€-PayPal-brightgreen.svg" />
  </a>
</p>

## Description

Svelte Simple Router is a native Single Page Application (SPA) router for Svelte 5, designed for seamless client-side navigation while leveraging Svelte's reactivity and transitions.

It supports both History API and hash routing, offering flexible URL management with robust path matching, query parameter handling, and dynamic interpolation. Packed with features like nested views, route guards, lazy loading, dynamic routing, and full integration with Svelte’s Transition API and the View Transitions API, it enables smooth and interactive navigation experiences.

Built to be easy to use yet powerful, Svelte Simple Router is the perfect solution for developers looking to add routing to their Svelte applications without unnecessary complexity.

## Prerequisites

Note: Svelte Simple Router is a svelte 5 native library, and will not work with prior versions of svelte.

- svelte >= 5.0.0

## Install

```sh
pnpm add @dvcol/svelte-simple-router
```

## Getting Started

The minimal setup requires a `RouterView` component and a list of routes.

The `RouterView` component will render the component associated with the current route in place.

You can find a complete example in the [demo app](https://github.com/dvcol/svelte-simple-router/blob/main/demo/App.svelte), or [this playground](https://svelte.dev/playground/4dff6a053c024e729e203b5c37d9029c?version=5.25.10).

```svelte
<script lang="ts">
  import type { Route, RouterOptions } from '@dvcol/svelte-simple-router/models';

  import { RouterView } from '@dvcol/svelte-simple-router/components';
  import GoodbyeComponent from '~/components/goodbye/GoodbyeComponent.svelte';
  import HelloComponent from '~/components/hello/HelloComponent.svelte';

  const RouteName = {
    Hello: 'hello',
    Goodbye: 'goodbye',
    Home: 'home',
    Any: 'any',
  } as const;

  type RouteNames = (typeof RouteName)[keyof typeof RouteName];

  const routes: Readonly<Route<RouteNames>[]> = [
    {
      name: RouteName.Home,
      path: '/',
      redirect: {
        name: RouteName.Hello,
      },
    },
    {
      name: RouteName.Hello,
      path: `/${RouteName.Hello}`,
      component: HelloComponent,
    },
    {
      name: RouteName.Goodbye,
      path: `/${RouteName.Goodbye}`,
      component: GoodbyeComponent,
    },
    {
      name: RouteName.Any,
      path: '*',
      redirect: {
        name: RouteName.Hello,
      },
    },
  ] as const;

  const options: RouterOptions<RouteNames> = {
    routes,
  } as const;

</script>

<RouterView {options} />
```

## Advanced Usage

- [Router Context](#router-context)
- [Debuggers](#debuggers)
- [Nested routes](#nested-routes)
- [Router transition](#router-transition)
  - [Svelte transition](#svelte-transition)
  - [View Transition API](#view-transition-api)
- [Dom actions](#dom-actions)
  - [Link action](#link-action)
  - [Links action](#links-action)
  - [Active action](#active-action)
- [Programmatic navigation](#programmatic-navigation)
  - [Hooks](#hooks)
  - [Router instance](#router-instance)
  - [Outside component tree](#outside-component-tree)
- [Dynamic routes](#dynamic-routes)
- [Guards and listeners](#guards-and-listeners)
  - [Navigation listeners](#navigation-listeners)
  - [Loading Listeners](#loading-listeners)
- [Lazy routing](#lazy-routing)
- [Routes](#routes)
- [Router](#router)

### Router Context

The `RouterContext` component injects the router instance into the component tree.

It can be used to share a router instance between `RouterView` components without the need to pass it down as a prop.

```svelte
<script lang="ts">
  import { RouterContext } from '@dvcol/svelte-simple-router/components';
</script>

<RouterContext>
  <!--  children  -->
</RouterContext>
```

### Debuggers

The `RouterDebugger` and `RouteDugger` component will display the current route and router state.

It can be used to debug the router configuration and the current route.

It requires to be placed inside a `RouterView` or `RouterContext` component.

```svelte
<script lang="ts">
  import { RouterView } from '@dvcol/svelte-simple-router/components';
  import { RouteDebugger, RouterDebugger } from '@dvcol/svelte-simple-router/components/debug';
</script>

<RouterView>
  <RouterDebugger />
  <RouteDebugger />
</RouterView>
```

### Nested routes

The `RouterView` component can be nested under another `RouterView` or `RouterContext` component.

Named `RouterView` components can be used to render different components on the same route.

Each `RouterView` grabs the router context from the nearest `RouterContext` or `RouterView` component.

Note: Sibling `RouterView` or `RouterContext` components will instantiate a new router instance.

```svelte
<script lang="ts">
  import type { Route, RouterOptions } from '@dvcol/svelte-simple-router/models';

  import { RouterContext, RouterView } from '@dvcol/svelte-simple-router/components';
  import ChildComponent from '~/components/goodbye/ChildComponent.svelte';
  import ParentComponent from '~/components/hello/ParentComponent.svelte';

  const RouteName = {
    Parent: 'parent',
    Child: 'child',
  } as const;

  type RouteNames = (typeof RouteName)[keyof typeof RouteName];

  export const routes: Readonly<Route<RouteNames>[]> = [
    {
      name: RouteName.Parent,
      path: `/${RouteName.Parent}`,
      component: ParentComponent,
    },
    {
      name: RouteName.Nested,
      path: `/${RouteName.Parent}/${RouteName.Child}`,
      components: {
        default: ParentComponent,
        nested: ChildComponent,
      },
    },
  ] as const;

  export const options: RouterOptions<RouteNames> = {
    routes,
  } as const;

</script>

<RouterContext {options}>
  <RouterView>
    <!--  will render ParentComponent  -->
  </RouterView>

  <RouterView name="nested">
    <!--  will only render ChildComponent on /parent/child, and nothing on /parent -->
  </RouterView>
</RouterContext>
```

### Router transition

#### Svelte transition

The `RouterView` component can take a `transition` [prop](https://github.com/dvcol/svelte-simple-router/blob/1ca370af1d892f8291d2464145c6a582eeee7438/src/lib/models/router.model.ts#L97-L122) to animate the route transition.

It wraps the route component in a div with optionals `in` and `out` transitions.

A default fade/scale transition is provided, but you can pass your own [transitions](https://github.com/dvcol/svelte-simple-router/blob/1ca370af1d892f8291d2464145c6a582eeee7438/src/lib/models/router.model.ts#L97-L122).

Note: By default the first enter transition is ignored, you can change this behavior by setting the `skipFirst` option to `false`.

```svelte
<script lang="ts">
  import { RouterView } from '@dvcol/svelte-simple-router/components';
  import { transition } from '@dvcol/svelte-simple-router/utils';

  ...
</script>

<RouterView {transition} {options} />
```

#### View Transition API

If you want to use the [view-transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) instead, you can pass a `viewTransitionName` key in the `transition` prop of the `RouterView` component.

If `viewTransitionName` is a string, it will be used as the `viewTransitionName`, otherwise a unique id will be generated `sr-container-<router-id>-<view-id>`.

Then, you can use one or a combination of lifecycle hooks like `onChange` or `onStart` to trigger transitions.

```svelte
<script lang="ts">
  import { onChange, onError, onLoaded } from '@dvcol/svelte-simple-router/router';

  let resolve: () => void;

  const starTransition = () => {
    const { promise: transition, resolve: end } = Promise.withResolvers<void>();
    resolve = end;

    const { promise: wait, resolve: start } = Promise.withResolvers<void>();
    document.startViewTransition(async () => {
      start();
      await transition;
    });
    return wait;
  };

  onChange(async () => {
    if (resolve) resolve();
    return starTransition();
  });

  onError(() => resolve?.());
  onLoaded(() => resolve?.());
</script>
```

### Dom actions

#### Link action

The `link action` intercepts click events on dom elements and triggers a router navigation instead.

The link action will prevent the default behavior and use the router only if the following conditions are met:

- The element is within a router context
- The event is a left click or enter key
- The event does not have a modifier key
- The target is not an external link (for anchor elements)
- The target is not a new tab or window (for anchor elements)

Additionally:

- The action merge data-attributes with the options passed as argument.
- Passed options have precedence over data-attributes.
- If attribute expects a JSON object, it will be parsed.
- If a name or path parameter are provided, they will be used to navigate and href will be ignored.
- Name takes precedence over path.
- If the host is not an anchor element, the role and tabindex attributes will be set.
- If resolve: true is passed, the target route will be resolved and any lazy component will be loaded on hover/focus
- If resolve: view-name is passed, only the target view will be resolved/loaded on hover/focus.

Note: The action requires the router context to be present in the component tree.

```svelte
<script lang="ts">
  import { link } from '@dvcol/svelte-simple-router/router';
</script>

<a href="/path/:param?query=value" use:link>simple link</a>
<a href='goodbye' name use:link>named link</a>
<a href='/path/:param' data-query='{"query":"value"}' use:link>link with query</a>
<a href='/path/:param' use:link="{ params: { param: 'value' } }">link with params</a>
<div href='/path/:param' use:link="{ params: { param: 'value' } }">div link</div>
<button href='/path/:param' use:link="{ params: { param: 'value' } }">button link</button>
```

#### Links action

The `links action` intercepts click events on dom elements and upwardly navigate the dom tree until it reaches a link element and triggers a router navigation instead.

The links action will recognize a parent node as a router link if it satisfies any of the following conditions:

- The element is an anchor element
- The element has a `data-router-link` attribute
- The element satisfies the `apply` selector function passed as argument

When a node is recognized as a router link, the action will behave as the `link` action (all restrictions apply).

Additionally:

- The action requires either valid href or data-attributes to navigate.
- Once the action reaches the host element or the `boundary` element (or selector function), it will stop evaluating the dom tree.

Note: The action requires the router context to be present in the component tree.
Note: Unlike use:link, use:links does not normalize link attributes (role, tabindex, href).

```svelte
<script lang="ts">
  import { links } from '@dvcol/svelte-simple-router/router';
</script>

<div use:links>
  <div>
    <a href="/path/:param?query=value">simple link</a>
  </div>
  <div data-router-link data-name="Hello">
    <span>simple span</span>
  </div>
</div>
```

#### Active action

The `active action` adds an active state (class, style or attribute) to an element when the route matches.

Additionally:

- If attached to an anchor element, it will attempt to match the href attribute.
- If path or name options are provided, they will take precedence over the element attributes.
- Name always takes precedence over path.
- When the route un-matches, the original style will be restored.

Note: The action requires the router context to be present in the component tree.

```svelte
<script lang="ts">
  import { active } from '@dvcol/svelte-simple-router/action';
</script>

<a href="/path" use:active>simple link</a>
<a href="/path" data-name="route-name" use:active>named link</a>
<button use:active="{ path: '/path' }">button link</button>
<div use:active="{ name: 'route-name' }">div link</div>
```
#### Active attachment

The `active attachment` adds an active state (class, style or attribute) to an element when the route matches.

Similar to the `active` action, see the [active action](#active-action) for more information.

```svelte
<script lang="ts">
  import { useActive } from '@dvcol/svelte-simple-router/attachment';
</script>

<a href="/path" {@attach useActive()}>simple link</a>
<a href="/path" data-name="route-name" {@attach useActive()}>named link</a>
<button {@attach useActive({ path: '/path' })}>button link</button>
<div {@attach useActive({ name: 'route-name' })}>div link</div>
```

### Programmatic navigation

#### Hooks

- `hasRouter` & `useRouter` - Returns the router instance

Must be used within a `RouterView` or `RouterContext`.

```svelte
<script lang="ts">
  import { useRouter } from '@dvcol/svelte-simple-router/router';

  const router = useRouter();
</script>
```

- `hasView` & `useView` - Returns the view instance

Must be used within a `RouterView`.

```svelte
<script lang="ts">
  import { useView } from '@dvcol/svelte-simple-router/router';

  const view = useView();
</script>
```

- `useRoute` - Returns the current `route`, `location` and the `routing`state

Must be used within a `RouterView` or `RouterContext`.

```svelte
<script lang="ts">
  import { useRoute } from '@dvcol/svelte-simple-router/router';

  const { route, location, routing } = $derived(useRoute());

  const reactiveRoute = $derived(route);
  const reactiveLocation = $derived(location);
  const reactiveRoutingState = $derived(routing);

  const pathParams = $derived(location.params);
  const queryParams = $derived(location.query);
</script>
```

- `useNavigate` - Returns utility function to start navigation logic.

Must be used within a `RouterView` or `RouterContext`.

```svelte
<script lang="ts">
  import { useNavigate } from '@dvcol/svelte-simple-router/router';

  const { resolve, push, replace, back, forward, go } = useNavigate();
</script>
```

- `beforeEach` - Returns a onMount hook that register (and auto-clean) a listener that triggers before each navigation event

Must be used within a `RouterView` or `RouterContext`.

```svelte
<script lang="ts">
  import { beforeEach } from '@dvcol/svelte-simple-router/router';

  beforeEach((event) => {
    console.info('before navigation', event);
  });
</script>
```

- `onStart` - Returns a onMount hook that register (and auto-clean) a listener that triggers at the start of each navigation event

Must be used within a `RouterView` or `RouterContext`.

```svelte
<script lang="ts">
  import { onStart } from '@dvcol/svelte-simple-router/router';

  onStart((event) => {
    console.info('start of navigation', event);
  });
</script>
```

- `onEnd` - Returns a onMount hook that register (and auto-clean) a listener that triggers at the end of each navigation event

Must be used within a `RouterView` or `RouterContext`.

```svelte
<script lang="ts">
  import { onEnd } from '@dvcol/svelte-simple-router/router';

  onEnd((event) => {
    console.info('end of navigation', event);
  });
</script>
```

- `onChange` - Returns a onMount hook that register (and auto-clean) a listener that triggers at the start of a view change.

Must be used within a `RouterView`.

```svelte
<script lang="ts">
  import { onChange } from '@dvcol/svelte-simple-router/router';

  onChange((event) => {
    console.info('start of view change', event);
  });
</script>
```

- `onLoading` - Returns a onMount hook that register (and auto-clean) a listener that triggers when a view start loading an async component.

Must be used within a `RouterView`.

```svelte
<script lang="ts">
  import { onLoading } from '@dvcol/svelte-simple-router/router';

  onLoading((event) => {
    console.info('loading view', event);
  });
</script>
```

- `onLoaded` - Returns a onMount hook that register (and auto-clean) a listener that triggers when a view finish loading a component.

Must be used within a `RouterView`.

```svelte
<script lang="ts">
  import { onLoaded } from '@dvcol/svelte-simple-router/router';

  onLoaded((event) => {
    console.info('view loaded', event);
  });
</script>
```

- `onError` - Returns a onMount hook that register (and auto-clean) a listener that triggers when an error occurs during navigation or view change.

Must be used within a `RouterView`.

```svelte
<script lang="ts">
  import { NavigationEvent, onError, ViewChangeEvent } from '@dvcol/svelte-simple-router/router';

  onError((err, event) => {
    if (event instanceof NavigationEvent) {
      console.error('Navigation Error', { err, event });
    } else if (event instanceof ViewChangeEvent) {
      console.error('View change error', { err, event });
    } else {
      console.error('Unknown Error', { err, event });
    }
  });
</script>
```

- `onViewError` - Returns a onMount hook that register (and auto-clean) a listener that triggers when an error occurs during view change.

Must be used within a `RouterView`.

```svelte
<script lang="ts">
  import { onViewError } from '@dvcol/svelte-simple-router/router';

  onViewError((err, event) => {
    console.error('View change error', { err, event });
  });
</script>
```

- `onRouterError` - Returns a onMount hook that register (and auto-clean) a listener that triggers when an error occurs during navigation.

Must be used within a `RouterView` or `RouterContext`.

```svelte
<script lang="ts">
  import { onRouterError } from '@dvcol/svelte-simple-router/router';

  onRouterError((err, event) => {
    console.error('Navigation error', { err, event });
  });
</script>
```

#### Router instance

For more complexe usage, you can grab the router instance from the context and call the `push` or `replace` methods.

See the [router model](https://github.com/dvcol/svelte-simple-router/blob/1ca370af1d892f8291d2464145c6a582eeee7438/src/lib/models/router.model.ts#L482-L501) for more information.

```svelte
<script lang="ts">
  import { useRouter } from '@dvcol/svelte-simple-router/router';

  const router = useRouter();

  const onPush = () => {
    router.push({ path: '/route-path' });
  };

  const onReplace = () => {
    router.replace({ name: 'route-name' });
  };
</script>
```

#### Outside component tree

If you need to access the router instance outside of a component, you can instantiate a router instance and pass it to the `RouterContext` or `RouterView` component.

```ts
import { Router } from '@dvcol/svelte-simple-router/router';

export const router = new Router();
```

```svelte
<script lang="ts">
  import { RouterView } from '@dvcol/svelte-simple-router/components';

  import { router } from './router';
</script>

<RouterView {router} />
```

Router navigation support several [options](https://github.com/dvcol/svelte-simple-router/blob/1ca370af1d892f8291d2464145c6a582eeee7438/src/lib/models/route.model.ts#L28-L60):

- `name` or `path` to navigate to a named or path route.
- `params` to pass route parameters.
- `query` to pass query parameters.
- `state` to pass an history state object.
- `meta` to pass an arbitrary object to the route (will be merged with the route meta).
- `title` to set the document title (will override the route title).
- `stripQuery` to remove current query parameters from the url.
- `stripHash` to remove the hash from the url (only in path mode).
- `stripTrailingHash` to remove the trailing hash from the url (only in hash mode).

You can also override the router's navigation [options](https://github.com/dvcol/svelte-simple-router/blob/1ca370af1d892f8291d2464145c6a582eeee7438/src/lib/models/router.model.ts#L199-L248):

- `base` to set the base path for the router.
- `hash` to enable hash routing.
- `strict` to enable strictly match routes (i.e. /path will not match /path/child).
- `force` to force navigation even if the route is the same.
- `caseSensitive` to enable case sensitive route names.
- `failOnNotFound` to throw an error when a route is not found.
- `metaAsState` to pass the route meta as state when navigating.
- `nameAsTitle` to set the document title to the route name.
- `followGuardRedirects` to follow guard redirects.

### Dynamic routes

You can dynamically [add or remove](https://github.com/dvcol/svelte-simple-router/blob/1ca370af1d892f8291d2464145c6a582eeee7438/src/lib/models/router.model.ts#L387-L411) routes from the router instance.

Note that although the inner route map are reactive, adding or removing routes will not trigger a re-synchronization of the router state.

To force a re-synchronization, you can call the [`sync` method](https://github.com/dvcol/svelte-simple-router/blob/1ca370af1d892f8291d2464145c6a582eeee7438/src/lib/models/router.model.ts#L453) on the router instance.

You can also use the `RouteView` component to declare routes dynamically.
When the component is added to the component tree, the routes will be added to the router instance.
When the component is removed from the component tree, the routes will be removed from the router instance.

RouteView can be passed a `route` object and will add it to the closest router instance.
Additionally, if the component/components/redirect are missing, it will try to infer them from the component's children and snippets.
When inside a named `RouterView`, the children will be added to the components object under the `name` key (provided or discovered through context).

RouteView supports the same error and loading snippets as the RouterView component.
In addition, named children can be passed as snippets to the component and will be injected into the `components` object.
If a snippet with the same `name` as the `RouterView` is found, the children will be injected into the `components` object under the `default` key instead.

**Note**:
Inputs are not reactive, so you will need to un-mout and remount the component to trigger a route update.
It is recommended to use the router instance directly if you need to frequently update routes.

```svelte
<script lang="ts">
  import type { PartialRoute } from '@dvcol/svelte-simple-router/models';

  import { RouterContext, RouterView, RouteView } from '@dvcol/svelte-simple-router/components';
  import { toLazyComponent } from '@dvcol/svelte-simple-router/utils';
  import ChildComponent from '~/components/goodbye/ChildComponent.svelte';
  import ParentComponent from '~/components/hello/ParentComponent.svelte';

  const LazyComponent = toLazyComponent(() => import('./LazyComponent.svelte'));

  const parent: PartialRoute = {
    name: 'parent',
    path: '/parent',
  };

  const child: PartialRoute = {
    name: 'child',
    path: '/parent/child',
  };

</script>

<RouterContext {options}>
  <RouterView>
    <RouteView route={parent}>
      <!-- Will render the children in this 'default' RouterView -->
      <ParentComponent />

      <!-- Will render this snippet in the 'nested' RouterView -->
      {#snippet nested()}
        <ChildComponent />
      {/snippet}
    </RouteView>
  </RouterView>

  <RouterView name="nested">
    <RouteView route={parent}>
      <!-- Will render the children in this 'nested' RouterView, and nothing in the default when  on '/parent/child' -->
      <ChildComponent />
    </RouteView>

    <!-- Inline example -->
    <RouteView route={{ path: '/other' }} children={ParentComponent} nested={LazyComponent} />
  </RouterView>
</RouterContext>
```

### Guards and listeners

#### Navigation listeners

The `route` and `router` supports several navigation guards and listeners:

- [beforeEnter](https://github.com/dvcol/svelte-simple-router/blob/1ca370af1d892f8291d2464145c6a582eeee7438/src/lib/models/route.model.ts#L269) to run before a route is resolved.
- [beforeLeave](https://github.com/dvcol/svelte-simple-router/blob/1ca370af1d892f8291d2464145c6a582eeee7438/src/lib/models/route.model.ts#L273) to run before a route is removed.
- [beforeEach](https://github.com/dvcol/svelte-simple-router/blob/1ca370af1d892f8291d2464145c6a582eeee7438/src/lib/models/router.model.ts#L420) to run before any route is resolved.

Guards trigger after url change and before the route component is rendered.

If a guard returns `false`, and object of instance `Error` or `throws`, the navigation will be aborted and the error will be thrown.

If a guard returns an object with a `path` or `name` property, the navigation will be redirected to the provided route, if any is found and `followGuardRedirects` is enabled.

The `router` ([dynamically](https://github.com/dvcol/svelte-simple-router/blob/1ca370af1d892f8291d2464145c6a582eeee7438/src/lib/models/router.model.ts#L422-L447) or through [options](https://github.com/dvcol/svelte-simple-router/blob/1ca370af1d892f8291d2464145c6a582eeee7438/src/lib/models/router.model.ts#L307-L317)) and `RouterView` also support several event listeners:

- `onStart` - executed when the navigation is triggered but before the route is resolved (fires on start and redirects).
- `onEnd` - executed when the navigation is triggered and the route is resolved (fires on successful and failed navigation, but not on cancelled/redirected).
- `onError` - executed when the navigation is triggered but an error occurs.

Note: The `onError` listeners passed to a `RouterView` will listen to both the router and view events. If you want to listen to only the router events, you can pass the listeners to the `router` options or instance directly.

#### Loading Listeners

The `RouterView` supports several view change listeners that triggers once the navigation concludes and the view starts changing.

- `onChange` - executed when a view starts to change.
- `onLoading` - executed when a view starts loading an async component.
- `onLoaded` - executed when a view finish loading a component.
- `onError` - executed when an error occurs during view change.

Note: The `onError` listeners passed to a `RouterView` will listen to both the router and view events. If you want to listen to only the view events, you can pass the listeners to the `view` instance directly.

### Lazy routing

The `Route` object supports lazy loading of the route component(s).

When the `component` property is a lazy import, the router will resolve the matched component before rendering it.

While the component is being resolved, the `loading` component will be rendered if any, the `loading` snippet if any, or nothing.

Similarly, if an error occurs during the component resolution, the `error` component will be rendered if any, the `error` snippet if any, or nothing.

The router will try to infer if a component is a lazy import by checking it's name (to detect component arrow functions) and it's constructor name (to detect async arrow functions), but for more complex cases, you can use the `toLazyComponent` wrapper.
Nested lazy components require the wrapper to be used or the function to be manually named `component`.

```svelte
<script lang="ts">
  import type { Route } from '@dvcol/svelte-simple-router/models';

  import { RouterView } from '@dvcol/svelte-simple-router/components';
  import { toLazyComponent } from '@dvcol/svelte-simple-router/utils';

  const routes: Readonly<Route[]> = [
    {
      name: 'lazy',
      path: '/lazy',
      component: () => import('./LazyComponent.svelte'),
      loading: () => import('./LoadingComponent.svelte'),
      error: () => import('./ErrorComponent.svelte'),
    },
    {
      name: 'lazy-snippet',
      path: '/lazy-snippet',
      component: () => import('./LazyComponent.svelte'),
    },
    {
      name: 'lazy-nested',
      path: '/lazy-nested',
      components: {
        default: async () => import('./LazyComponent.svelte'),
        nested: toLazyComponent(() => import('./NestedComponent.svelte')),
      },
    },
  ] as const;
</script>

<RouterView {routes}>
  {#snippet loading()}
    <h1>Default Loading...</h1>
  {/snippet}

  {#snippet error(err)}
    <h1>Default Error: {err}</h1>
  {/snippet}
</RouterView>
```

Note that loading indicator only trigger once the route has been resolved and not on initial navigation.
If you want to show a loading indicator on initial navigation, you can use the `routing` snippet instead.

This means navigation will be a three-step process:

- The `routing` snippet will be rendered.
- Then the `loading` component will be rendered.
- Then the route component or error component will be rendered.

### Routes

- Route path supports parameters. Parameters are defined by a colon followed by the parameter name.

```
/path/:param
```

- Parameters can be optional by adding a question mark.

```
/path/:param:?
```

Parameters can also have a type constraint by adding `:{string}` or `:{number}` before the parameter name.

The router will only match the route if the parameter matches the type constraint.

```
/path/:{string}:param:?
```

Will match `/path/param` but not `/path/1`.

```
/path/:{number}:param
```

Will match `/path/1` but not `/path/param`.

- Route support wildcards. The `*` character will match any path segment.

```
/path/*
```

Will match `/path/param` and `/path/param/param`.

```
/path/*/:{number}:param/*
```

Will match `/path/any/12` and `/path/other/12/path/end`.

- Route can have a [redirect](https://github.com/dvcol/svelte-simple-router/blob/1ca370af1d892f8291d2464145c6a582eeee7438/src/lib/models/route.model.ts#L164-L170) property to redirect to another route (by path or name).
- Route can have [components, loadings or errors](https://github.com/dvcol/svelte-simple-router/blob/1ca370af1d892f8291d2464145c6a582eeee7438/src/lib/models/route.model.ts#L94-L162) properties to render the route component, loading component or error component respectively (see [lazy-routing](#lazy-routing)).
- Route can have a [meta](https://github.com/dvcol/svelte-simple-router/blob/1ca370af1d892f8291d2464145c6a582eeee7438/src/lib/models/route.model.ts#L236-L239) property to store additional information attached to the route.
- Route can have a [title](https://github.com/dvcol/svelte-simple-router/blob/1ca370af1d892f8291d2464145c6a582eeee7438/src/lib/models/route.model.ts#L232-L235) property to set the document title when the route is active (if `nameAsTitle` is enabled).
- Route can have [default query or params](https://github.com/dvcol/svelte-simple-router/blob/1ca370af1d892f8291d2464145c6a582eeee7438/src/lib/models/route.model.ts#L240-L249) to be used when navigating to the route.
- Route can have [guard properties](https://github.com/dvcol/svelte-simple-router/blob/1ca370af1d892f8291d2464145c6a582eeee7438/src/lib/models/route.model.ts#L266-L273) to run before the route is resolved (see [guards and listeners](#guards-and-listeners)).
- Route can provide their own [matcher](https://github.com/dvcol/svelte-simple-router/blob/1ca370af1d892f8291d2464145c6a582eeee7438/src/lib/models/route.model.ts#L265) object to resolve the active route.
- Route can have [children](https://github.com/dvcol/svelte-simple-router/blob/1ca370af1d892f8291d2464145c6a582eeee7438/src/lib/models/route.model.ts#L257) routes that will be parsed by the router instance.

### Router

In addition to default navigation options (see [programmatic navigation](#programmatic-navigation)), the router instance supports several [options](https://github.com/dvcol/svelte-simple-router/blob/1ca370af1d892f8291d2464145c6a582eeee7438/src/lib/models/router.model.ts#L256-L318):

- `history` to set the history instance the router will use (defaults to global.history).
- `location` to set the location instance the router will use (defaults to global.location).
- `listen` to listen to `popstate` or `navigation` events and trigger synchronization.
- `priority` to set the priority when multiple routes match the current path.
- `caseSensitive` to enable case sensitive route names.
- And various [guards and listeners](#guards-and-listeners).

## Author

- Github: [@dvcol](https://github.com/dvcol)

## Show your support

Give a ⭐️ if this project helped you!

 <a href="https://paypal.me/dvcol/5" target="_blank">
    <img alt="donate" src="https://img.shields.io/badge/Donate%20€-PayPal-brightgreen.svg" />
</a>

## 📝 License

This project is [MIT](https://github.com/dvcol/svelte-simple-router/blob/master/LICENSE) licensed.

---

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
