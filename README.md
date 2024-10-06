
<h1 align="center">Welcome to <i>Svelte Simple Router</i></h1>
<p>
  <img src="https://img.shields.io/badge/pnpm-%3E%3D7.0.0-blue.svg" />
  <img src="https://img.shields.io/badge/node-%3E%3D17.0.0-blue.svg" />
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

> <Web Extension Template> description here
## Prerequisites

- svelte >= 5.0.0

## Install

```sh
pnpm add @dvcol/svelte-simple-router
```

## Getting Started

The minimal setup requires a `RouterView` component and a list of routes.

The `RouterView` component will render the component associated with the current route in place.

You can find a complete example in the [demo app](https://github.com/dvcol/svelte-simple-router/blob/main/demo/App.svelte).

```svelte
<script lang="ts">
  import { RouterView } from '@dvcol/svelte-simple-router/components';

  import type { Route, RouterOptions } from '@dvcol/svelte-simple-router/models';
  
  import HelloComponent from '~/components/hello/HelloComponent.svelte';
  import GoodbyeComponent from '~/components/goodbye/GoodbyeComponent.svelte';

  const RouteName = {
    Hello: 'hello',
    Goodbye: 'goodbye',
    Home: 'home',
    Any: 'any',
  } as const;

  type RouteNames = (typeof RouteName)[keyof typeof RouteName];

  export const routes: Readonly<Route<RouteNames>[]> = [
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
      component: HelloComponent
    },
    {
      name: RouteName.Goodbye,
      path: `/${RouteName.Goodbye}`,
      component: GoodbyeComponent
    },
    {
      name: RouteName.Any,
      path: '*',
      redirect: {
        name: RouteName.Hello,
      },
    },
  ] as const;

  export const options: RouterOptions<RouteNames> = {
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
- [Dom actions](#dom-actions)
  - [Link action](#link-action)
  - [Active action](#active-action)
- [Programmatic navigation](#programmatic-navigation)
- [Dynamic routes](#dynamic-routes)
- [Guards and listeners](#guards-and-listeners)
- [Lazy routing](#lazy-routing)
- [Routes](#routes)
- [Router](#router)

### Router Context

The `RouterContext` component injects the router instance into the component tree.

It can be used to share a router instance between `RouterView` components without the need to pass it down as a prop.

```svelte
<script lang="ts">
  import { RouterContext } from '@dvcol/svelte-simple-router/components';
  import { RouterView } from '@dvcol/svelte-simple-router/components';
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
  import { RouterDebugger, RouteDebugger } from '@dvcol/svelte-simple-router/components/debug';
  import { RouterView } from '@dvcol/svelte-simple-router/components';
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
  import { RouterView } from '@dvcol/svelte-simple-router/components';
  import { RouterContext } from '@dvcol/svelte-simple-router/components';

  import type { Route, RouterOptions } from '@dvcol/svelte-simple-router/models';
  
  import ParentComponent from '~/components/hello/ParentComponent.svelte';
  import ChildComponent from '~/components/goodbye/ChildComponent.svelte';

  const RouteName = {
    Parent: 'parent',
    Child: 'child',
  } as const;

  type RouteNames = (typeof RouteName)[keyof typeof RouteName];

  export const routes: Readonly<Route<RouteNames>[]> = [
    {
      name: RouteName.Parent,
      path: `/${RouteName.Parent}`,
      component: ParentComponent
    },
    {
      name: RouteName.Nested,
      path: `/${RouteName.Parent}/${RouteName.Child}`,
      components: {
        default: ParentComponent,
        nested: ChildComponent,
      }
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
  import { active } from '@dvcol/svelte-simple-router/router';
</script>

<a href="/path" use:active>simple link</a>
<a href="/path" data-name="route-name" use:active>named link</a>
<button :use:active="{ path: '/path' }">button link</button>
<div :use:active="{ name: 'route-name' }">div link</div>
```

### Programmatic navigation

To navigate without a dom link, you can grab the router instance from the context and call the `push` or `replace` methods.

See the [router model](https://github.com/dvcol/svelte-simple-router/blob/1ca370af1d892f8291d2464145c6a582eeee7438/src/lib/models/router.model.ts#L482-L501) for more information.

```svelte

<script lang="ts">
  import { RouterContext } from '@dvcol/svelte-simple-router/components';
  import { RouterView } from '@dvcol/svelte-simple-router/components';
  import { useRouter } from '@dvcol/svelte-simple-router/router';
  
  const router = useRouter();
  
  const onPush = () => {
    router.push({ path: "/route-path" });
  };
  
  const onReplace = () => {
    router.replace({ name: "route-name" });
  };
</script>
```

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

### Guards and listeners

The `route and `router` supports several navigation guards and listeners:

- [beforeEnter](https://github.com/dvcol/svelte-simple-router/blob/1ca370af1d892f8291d2464145c6a582eeee7438/src/lib/models/route.model.ts#L269) to run before a route is resolved.
- [beforeLeave](https://github.com/dvcol/svelte-simple-router/blob/1ca370af1d892f8291d2464145c6a582eeee7438/src/lib/models/route.model.ts#L273) to run before a route is removed.
- [beforeEach](https://github.com/dvcol/svelte-simple-router/blob/1ca370af1d892f8291d2464145c6a582eeee7438/src/lib/models/router.model.ts#L420) to run before any route is resolved.

Guards trigger after url change and before the route component is rendered.

If a guard returns `false`, and object of instance `Error` or `throws`, the navigation will be aborted and the error will be thrown.

If a guard returns an object with a `path` or `name` property, the navigation will be redirected to the provided route, if any is found and `followGuardRedirects` is enabled.

The `router` ([dynamically](https://github.com/dvcol/svelte-simple-router/blob/1ca370af1d892f8291d2464145c6a582eeee7438/src/lib/models/router.model.ts#L422-L447) or through [options](https://github.com/dvcol/svelte-simple-router/blob/1ca370af1d892f8291d2464145c6a582eeee7438/src/lib/models/router.model.ts#L307-L317)) and `RouterView` also support several event listeners:
- onStart - executed when the navigation is triggered but before the route is resolved (fires on start and redirects).
- onEnd - executed when the navigation is triggered and the route is resolved (fires on successful and failed navigation, but not on cancelled/redirected).
- onError - executed when the navigation is triggered but an error occurs.

### Lazy routing

The `Route` object supports lazy loading of the route component(s).

When the `component` property is a lazy import, the router will resolve the matched component before rendering it.

While the component is being resolved, the `loading` component will be rendered if any, the `loading` snippet if any, or nothing.

Similarly, if an error occurs during the component resolution, the `error` component will be rendered if any, the `error` snippet if any, or nothing.

The router will try to infer if a component is a lazy import by checking it's name, but for more complex cases, you can use the `toLazyComponent` wrapper.
Nested lazy components require the wrapper to be used or the function to be manually named `component`. 

```svelte
<script lang="ts">
    import { RouterView } from '@dvcol/svelte-simple-router/components';
    import { toLazyComponent } from '@dvcol/svelte-simple-router/utils';
    
    import type { Route, RouterOptions } from '@dvcol/svelte-simple-router/models';
    
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
            component: () => import('./LazyComponent.svelte')
        },
        {
            name: 'lazy-nested',
            path: '/lazy-nested',
            components: {
                default: toLazyComponent(() => import('./LazyComponent.svelte')),
                nested: toLazyComponent(() => import('./NestedComponent.svelte')),
            }
        }
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
/path/:param?
```

Parameters can also have a type constraint by adding `:{string}` or `:{number}` before the parameter name.

The router will only match the route if the parameter matches the type constraint.

```
/path/:{string}:param?
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

* Github: [@dvcol](https://github.com/dvcol)

## Show your support

Give a ⭐️ if this project helped you!

 <a href="https://paypal.me/dvcol/5" target="_blank">
    <img alt="donate" src="https://img.shields.io/badge/Donate%20€-PayPal-brightgreen.svg" />
</a>

## 📝 License

This project is [MIT](https://github.com/dvcol/svelte-simple-router/blob/master/LICENSE) licensed.

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
