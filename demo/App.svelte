<script lang="ts">
  import { LogLevel } from '@dvcol/common-utils';
  import { tick } from 'svelte';

  import ErrorComponent from './Error.svelte';
  import GoodbyeComponent from './Goodbye.svelte';
  import HelloComponent from './Hello.svelte';

  import Loading from './Loading.svelte';

  import PathSelector from './PathSelector.svelte';

  import type { RouterOptions } from '~/models/router.model.js';

  import RouterContext from '~/components/RouterContext.svelte';
  import RouterView from '~/components/RouterView.svelte';
  import RouteDebugger from '~/components/debug/RouteDebugger.svelte';
  import RouterDebugger from '~/components/debug/RouterDebugger.svelte';
  import { Logger } from '~/utils/logger.utils';
  import { transition } from '~/utils/transition.utils';

  const RouteName = {
    Hello: 'Hello',
    Goodbye: 'Goodbye',
    Nested: 'Nested',
    Async: 'Async',
    Loading: 'Loading',
    LoadingCustom: 'LoadingCustom',
    Error: 'Error',
    ErrorCustom: 'ErrorCustom',
    Params: 'Params',
    Parent: 'Parent',
    Child: 'Child',
    Redirect: 'Redirect',
    BeforeRedirect: 'BeforeRedirect',
    BeforeEnterError: 'BeforeEnterError',
    SlowRoute: 'SlowRoute',
    Any: 'Any',
  } as const;

  type Routes = (typeof RouteName)[keyof typeof RouteName] | string;

  const routes: RouterOptions<Routes>['routes'] = [
    {
      name: RouteName.Hello,
      path: '/hello',
      component: HelloComponent,
      props: {
        title: RouteName.Hello,
      },
    },
    {
      name: RouteName.Goodbye,
      path: '/goodbye',
      component: GoodbyeComponent,
      props: {
        title: RouteName.Goodbye,
      },
    },
    {
      name: RouteName.Nested,
      path: '/nested',
      components: {
        default: HelloComponent,
        Nested: GoodbyeComponent,
      },
      properties: {
        default: {
          title: RouteName.Nested,
        },
        Nested: {
          title: RouteName.Nested,
        },
      },
    },
    {
      name: RouteName.Async,
      path: '/async',
      component: () => import('./Async.svelte'),
      loading: Loading,
      error: ErrorComponent,
      props: {
        title: RouteName.Async,
      },
    },
    {
      name: RouteName.Error,
      path: '/error',
      component: () => {
        throw new Error('Error, failed to import lazy component');
      },
      props: {
        title: RouteName.Error,
      },
      loading: Loading,
      beforeEnter: () => {
        console.info('Before enter Error');
      },
    },
    {
      name: RouteName.ErrorCustom,
      path: '/error-custom',
      component: () =>
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Error, failed to import lazy component')), 5000);
        }),
      props: {
        title: RouteName.ErrorCustom,
      },
      loading: Loading,
      error: ErrorComponent,
      beforeEnter: () => {
        console.info('Before enter Error');
      },
    },
    {
      name: RouteName.Loading,
      path: '/loading',
      component: () =>
        new Promise(resolve => {
          setTimeout(() => resolve({ default: HelloComponent }), 5000);
        }),
      props: {
        title: RouteName.Loading,
      },
    },
    {
      name: RouteName.LoadingCustom,
      path: '/loading-custom',
      loading: Loading,
      component: () =>
        new Promise(resolve => {
          setTimeout(() => resolve({ default: HelloComponent }), 5000);
        }),
      props: {
        title: RouteName.LoadingCustom,
      },
    },
    {
      name: RouteName.Params,
      path: '/base/path/*/:{number}:id:?/path/:{string}:name:?/:lastName/end',
      component: HelloComponent,
      meta: {
        title: 'Params',
      },
      params: {
        lastName: 'Doe',
      },
      query: {
        age: 18,
      },
      props: {
        title: 'custom title',
        subtitle: 'custom subtitle',
        onMoutHook: () => {
          console.info('on mount');
        },
        'transition:fade': { delay: 250, duration: 300 },
      },
    },
    {
      name: RouteName.Parent,
      path: '/parent',
      component: HelloComponent,
      children: [
        {
          name: RouteName.Child,
          path: 'child',
          component: GoodbyeComponent,
          props: {
            title: RouteName.Child,
          },
        },
      ],
      props: {
        title: RouteName.Parent,
      },
    },
    {
      name: RouteName.Redirect,
      path: '/redirect',
      redirect: {
        name: RouteName.Goodbye,
      },
    },
    {
      name: RouteName.BeforeRedirect,
      path: '/before-enter-redirect',
      component: HelloComponent,
      beforeEnter: () => {
        return {
          name: RouteName.Goodbye,
        };
      },
      props: {
        title: RouteName.BeforeRedirect,
      },
    },
    {
      name: RouteName.BeforeEnterError,
      path: '/before-enter',
      component: HelloComponent,
      beforeEnter: () => {
        throw new Error('Before enter Error');
      },
      props: {
        title: RouteName.BeforeEnterError,
      },
    },
    {
      name: RouteName.SlowRoute,
      path: '/slow',
      component: HelloComponent,
      beforeEnter: () =>
        new Promise(resolve => {
          setTimeout(() => resolve(), 5000);
        }),
      props: {
        title: RouteName.SlowRoute,
      },
    },
    {
      name: RouteName.Any,
      path: '*',
      redirect: {
        name: RouteName.Hello,
      },
    },
  ];

  const options: RouterOptions<Routes> = $state({
    listen: 'history',
    base: '/svelte-simple-router',
    hash: true,
    strict: false,
    failOnNotFound: false,
    metaAsState: false,
    nameAsTitle: false,
    followGuardRedirects: true,
    caseSensitive: false,
    beforeEach: (from, to) => {
      console.info('Option before each', { from, to });
    },
    onStart: (from, to) => {
      console.info('Option on start', { from, to });
    },
    onEnd: (from, to) => {
      console.info('Option on end', { from, to });
    },
    onError: (err, { from, to, route }) => {
      console.error('Option on error', { err, from, to, route });
    },
    routes,
  });

  const configs = $derived(Object.entries(options).filter(([_, v]) => typeof v === 'string' || typeof v === 'boolean')) as [
    keyof RouterOptions<Routes>,
    string | boolean,
  ][];

  let stripQuery = $state(false);
  let stripHash = $state(false);
  let stripTrailingHash = $state(false);
  let updateOnRouteChange = $state(false);

  let input = $state(`${options?.base ?? ''}${options?.hash ? '/#' : ''}/hello`);
  const onInputButton = () => {
    console.info('onInputButton', input);
    window.history.pushState({}, '', window.location.origin + input);
  };

  let mounted = $state(true);
  const refresh = async () => {
    mounted = false;
    await tick();
    mounted = true;
  };

  if (import.meta.env.DEV) Logger.logLevel = LogLevel.Debug;
</script>

<div class="row">
  <div class="column">
    <h3>Options</h3>
    <table>
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {#each configs as [key, value]}
          <tr>
            <td>{key}</td>
            <td>
              {#if key === 'base'}
                <input type="text" bind:value={options[key]} />
              {:else if key === 'listen'}
                <select bind:value={options[key]}>
                  <option value={'history'}>History</option>
                  <option value={'navigation'}>Navigation</option>
                  <option value={true}>True</option>
                  <option value={false}>False</option>
                </select>
              {:else if typeof value === 'boolean'}
                <input type="checkbox" bind:checked={options[key]} />
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    <div>
      <button onclick={refresh}>Refresh router</button>
    </div>
  </div>

  <div class="column">
    <h3>Push state</h3>
    <div class="row">
      <label for="stripQuery">Strip Query</label>
      <input id="stripQuery" type="checkbox" bind:checked={stripQuery} />
    </div>
    <div class="row">
      <label for="stripHash">Strip Hash</label>
      <input id="stripHash" type="checkbox" bind:checked={stripHash} />
    </div>
    <div class="row">
      <label for="stripTrailingHash">Strip Trailing Hash</label>
      <input id="stripTrailingHash" type="checkbox" bind:checked={stripTrailingHash} />
    </div>

    <div class="row">
      <label for="input">External Push State</label>
      <input id="input" type="text" bind:value={input} />
      <button onclick={onInputButton}>Go</button>
    </div>
  </div>
</div>

{#if mounted}
  <div class="column">
    <div class="row">
      <RouterView
        options={{ ...options, listen: false }}
        onLoading={_route => console.warn('View loading', _route)}
        onLoaded={_route => console.info('View loaded', _route)}
        onError={(err, { route: _route }) => console.error('View load error', { err, route: _route })}
        onStart={(from, to) => console.info('View start', { from, to })}
        onEnd={(from, to) => console.info('View end', { from, to })}
        beforeEach={(from, to) => console.info('View before each', { from, to })}
        transition={{
          ...transition,
          updateOnRouteChange,
          props: {
            container: {
              class: 'content',
            },
          },
        }}
      >
        <div class="column">
          <h2>Independent Router</h2>

          <PathSelector {stripQuery} {stripHash} {stripTrailingHash} />
          <div class="row update">
            <label for="update-on-route-change">Update transition on route change</label>
            <input id="update-on-route-change" type="checkbox" bind:checked={updateOnRouteChange} />
          </div>
        </div>

        <div class="column debuggers">
          <RouterDebugger />
          <RouteDebugger />
        </div>

        {#snippet loading()}
          <p>Default Loading...</p>
        {/snippet}

        {#snippet error(err)}
          <h1>Default Error</h1>
          <p class="error">Default Error: {err}</p>
        {/snippet}
      </RouterView>
    </div>

    <div class="row">
      <RouterContext {options}>
        <div class="column">
          <h2>Nested Router</h2>
          <PathSelector {stripQuery} {stripHash} {stripTrailingHash} />
        </div>

        <div class="column debuggers">
          <RouterDebugger />
          <RouteDebugger />
        </div>

        <div class="content">
          <RouterView {options}>
            <h2>View default</h2>

            {#snippet loading()}
              <p>Default Loading...</p>
            {/snippet}

            {#snippet error(err)}
              <h1>Default Error</h1>
              <p class="error">Default Error: {err}</p>
            {/snippet}
          </RouterView>

          <RouterView {options} name="Nested">
            <h2>View nested</h2>
          </RouterView>
        </div>
      </RouterContext>
    </div>
  </div>
{/if}

<style lang="scss" global>
  .row {
    display: flex;
    flex: 1 1 auto;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .update {
    padding: 0 1rem;
  }

  .column {
    gap: 1rem;
    margin: auto;
  }

  .content,
  .column {
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    padding: 1rem;
    border-radius: 0.5rem;
  }

  .debuggers {
    width: 30rem;
  }

  .content {
    flex: 1 1 auto;
    align-items: center;
    justify-content: center;
    padding: 1rem 2rem;
    border: 2px solid;
    border-radius: 0.5rem;
  }

  .error {
    max-width: 30rem;
    color: orangered;
  }
</style>
