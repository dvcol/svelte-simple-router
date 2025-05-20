<script lang="ts">
  import type { IRouter } from '~/models/router.model.js';

  import { useActive } from '~/attachment/active.attachment.svelte.js';
  import RouterView from '~/components/RouterView.svelte';

  const { router }: { router: IRouter } = $props();
</script>

<RouterView {router}>
  <span data-testid="span-error" {@attach useActive()}>error</span>

  <a data-testid="anchor-path" href="/home" {@attach useActive()}>path</a>
  <a data-testid="anchor-name" href="/other" data-name="home" {@attach useActive()}>name</a>

  <span data-testid="span-path" data-path="/home" {@attach useActive()}>path</span>
  <span data-testid="span-name" data-name="home" {@attach useActive()}>name</span>

  <div data-testid="param-path" data-path="/other" {@attach useActive({ path: '/home' })}></div>
  <div data-testid="param-name" data-name="other" {@attach useActive({ name: 'home' })}></div>

  <a data-testid="anchor-parent" href="/other" {@attach useActive()}>path-parent</a>
  <a data-testid="anchor-child" href="/other/target" {@attach useActive()}>path-child</a>
  <a data-testid="anchor-exact-parent" href="/other" {@attach useActive({ exact: true })}>path-exact-parent</a>

  <a data-testid="anchor-name-sensitive" href="/home" {@attach useActive({ name: 'Other', caseSensitive: true })}>path</a>
  <a data-testid="anchor-name-insensitive" href="/home" {@attach useActive({ name: 'Other' })}>path</a>

  <a data-testid="anchor-class-active" href="/home" {@attach useActive({ class: 'active' })}>path</a>
  <a data-testid="anchor-class-existing" href="/home" class="some-class" {@attach useActive({ class: 'active' })}>path</a>

  <a data-testid="anchor-style-active" href="/home" {@attach useActive({ style: { color: 'red' } })}>path</a>
  <a data-testid="anchor-style-existing" href="/home" style="color:blue; font-weight: bold;" {@attach useActive({ style: { color: 'red' } })}>path</a>
</RouterView>
