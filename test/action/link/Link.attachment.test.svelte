<script lang="ts">
  import type { IRouter } from '~/models/router.model.js';

  import { useLink } from '~/attachment/link.attachment.svelte.js';
  import RouterView from '~/components/RouterView.svelte';

  const { router }: { router: IRouter } = $props();
</script>

<RouterView {router}>
  <a data-testid="anchor-path" href="/home" {@attach useLink()}>path</a>
  <a data-testid="anchor-name" href="/other" data-name="home" {@attach useLink()}>name</a>
  <!-- eslint-disable-next-line -->
  <a data-testid="anchor-no-href" {@attach useLink({ path: '/home' })}>path</a>

  <span data-testid="span-path" data-path="/home" {@attach useLink()}>path</span>
  <span data-testid="span-name" data-name="home" {@attach useLink()}>name</span>

  <div data-testid="param-path" data-path="/other" {@attach useLink({ path: '/home' })}></div>
  <div data-testid="param-name" data-name="other" {@attach useLink({ name: 'home' })}></div>

  <div data-testid="disabled" disabled data-name="other" {@attach useLink({ name: 'home' })}></div>
  <div data-testid="disabled-true" disabled="true" data-name="other" {@attach useLink({ name: 'home' })}></div>
  <div data-testid="disabled-option" data-name="other" {@attach useLink({ name: 'home', disabled: true })}></div>
  <div data-testid="disabled-false" disabled="false" data-name="other" {@attach useLink({ name: 'home' })}></div>
  <div data-testid="disabled-any" disabled="any" data-name="other" {@attach useLink({ name: 'home' })}></div>

  <span
    data-testid="span-query-params"
    {@attach useLink({ path: '/home/:id/user/:name', query: { search: 'value', filter: 42 }, params: { id: 12, name: 'john' } })}
  >
    path
  </span>
  <span
    data-testid="span-query-params-string"
    data-path="/home/:id/user/:name"
    data-query={JSON.stringify({ search: 'value', filter: 42 })}
    data-params={JSON.stringify({ id: 12, name: 'john' })}
    {@attach useLink()}
  >
    path
  </span>

  <a
    data-testid="anchor-all-props"
    href="/home"
    target="_self"
    {@attach useLink({
      path: '/home/:id/user/:name',
      query: { search: 'value', filter: 42 },
      params: { id: 12, name: 'john' },
      state: { key: 'value' },
      meta: { key: 'value', nested: { key: 'value' } },
      title: 'override title',
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
    })}
  >
    path
  </a>

  <a
    data-testid="anchor-merge-props"
    href="/home"
    data-replace
    data-hash
    {@attach useLink({
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
    })}
  >
    path
  </a>

  <a data-testid="anchor-target-blank" href="/home" target="_blank" {@attach useLink()}>path new tab</a>
  <a data-testid="anchor-link-external" href="https://google.com" {@attach useLink()}>path external</a>

  <a data-testid="anchor-parsing-error" href="/home" data-params="id=12&name=john" {@attach useLink()}>error</a>

  <a data-testid="resolve-false" href="/home" {@attach useLink()}>path</a>
  <a data-testid="resolve-true" href="/home" {@attach useLink({ resolve: true })}>path</a>
  <a data-testid="resolve-view" href="/home" {@attach useLink({ resolve: 'view' })}>path</a>
</RouterView>
