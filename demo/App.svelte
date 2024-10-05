<script lang="ts">
  import ErrorComponent from './components/Error.svelte';
  import GoodbyeComponent from './components/Goodbye.svelte';
  import HelloComponent from './components/Hello.svelte';
  import Loading from './components/Loading.svelte';

  import DefaultRouter from './routers/DefaultRouter.svelte';
  import NestedRouters from './routers/NestedRouters.svelte';

  import type { RouterOptions } from '~/models/router.model.js';

  import { LogLevel } from '~/utils/logger.utils.js';
  import { toLazyComponent } from '~/utils/svelte.utils.js';

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
    BeforeLeaveError: 'BeforeLeaveError',
    SlowRoute: 'SlowRoute',
    Any: 'Any',
  } as const;

  type Routes = (typeof RouteName)[keyof typeof RouteName] | string;

  let beforeChecked = false;

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
        Nested: toLazyComponent(() => import('./components/Goodbye.svelte')),
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
      component: () => import('./components/Async.svelte'),
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
      meta: {
        redirect: RouteName.Goodbye,
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
      name: RouteName.BeforeLeaveError,
      path: '/before-leave',
      component: GoodbyeComponent,
      beforeLeave: () => {
        if (beforeChecked) {
          beforeChecked = false;
          return true;
        }
        beforeChecked = true;
        throw new Error('Before leave Error');
      },
      props: {
        title: RouteName.BeforeLeaveError,
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
</script>

<div class="column">
  <DefaultRouter {routes} logLevel={import.meta.env.DEV ? LogLevel.Debug : LogLevel.Info} />
  <NestedRouters {routes} />
</div>

<style lang="scss">
  .column {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    margin: auto;
    padding: 1rem;
    border-radius: 0.5rem;
  }

  // stylelint-disable-next-line selector-pseudo-class-no-unknown
  :global(.content) {
    display: flex;
    flex: 1 1 20rem;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 30vw;
    min-height: 30vh;
    padding: 1rem 2rem;
    border: 2px solid;
    border-radius: 0.5rem;
  }
</style>
