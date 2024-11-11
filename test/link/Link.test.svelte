<script lang="ts">
  import type { IRouter } from '~/models/router.model.js';

  import RouterView from '~/components/RouterView.svelte';
  import { link } from '~/router/link.svelte';

  const { router }: { router: IRouter } = $props();
</script>

<RouterView {router}>
  <a data-testid="anchor-path" href="/home" use:link>path</a>
  <a data-testid="anchor-name" href="/other" data-name="home" use:link>name</a>
  <!-- eslint-disable-next-line -->
  <a data-testid="anchor-no-href" use:link={{ path: '/home' }}>path</a>

  <span data-testid="span-path" data-path="/home" use:link>path</span>
  <span data-testid="span-name" data-name="home" use:link>name</span>

  <div data-testid="param-path" data-path="/other" use:link={{ path: '/home' }}></div>
  <div data-testid="param-name" data-name="other" use:link={{ name: 'home' }}></div>

  <div data-testid="disabled" disabled data-name="other" use:link={{ name: 'home' }}></div>
  <div data-testid="disabled-true" disabled="true" data-name="other" use:link={{ name: 'home' }}></div>
  <div data-testid="disabled-option" data-name="other" use:link={{ name: 'home', disabled: true }}></div>
  <div data-testid="disabled-false" disabled="false" data-name="other" use:link={{ name: 'home' }}></div>
  <div data-testid="disabled-any" disabled="any" data-name="other" use:link={{ name: 'home' }}></div>

  <span
    data-testid="span-query-params"
    use:link={{ path: '/home/:id/user/:name', query: { search: 'value', filter: 42 }, params: { id: 12, name: 'john' } }}
  >
    path
  </span>
  <span
    data-testid="span-query-params-string"
    data-path="/home/:id/user/:name"
    data-query={JSON.stringify({ search: 'value', filter: 42 })}
    data-params={JSON.stringify({ id: 12, name: 'john' })}
    use:link
  >
    path
  </span>

  <a
    data-testid="anchor-all-props"
    href="/home"
    target="_self"
    use:link={{
      path: '/home/:id/user/:name',
      query: { search: 'value', filter: 42 },
      params: { id: 12, name: 'john' },
      state: { key: 'value' },
      stripQuery: true,
      stripHash: true,
      stripTrailingHash: true,

      base: '/base',
      hash: true,
      strict: true,
      force: true,
      failOnNotFound: true,
      metaAsState: true,
      nameAsTitle: true,
      followGuardRedirects: true,
    }}
  >
    path
  </a>

  <a
    data-testid="anchor-merge-props"
    href="/home"
    data-replace
    data-hash
    use:link={{
      path: '/home/:id/user/:name',
      query: { search: 'value', filter: 42 },
      params: { id: 12, name: 'john' },
      state: { key: 'value' },
      stripQuery: true,
      stripHash: true,
      stripTrailingHash: true,

      base: '/base',
      hash: false,
      strict: true,
      force: true,
      failOnNotFound: true,
      metaAsState: true,
      nameAsTitle: true,
      followGuardRedirects: true,
    }}
  >
    path
  </a>

  <a data-testid="anchor-target-blank" href="/home" target="_blank" use:link>path new tab</a>
  <a data-testid="anchor-link-external" href="https://google.com" use:link>path external</a>

  <a data-testid="anchor-parsing-error" href="/home" data-params="id=12&name=john" use:link>error</a>
</RouterView>
