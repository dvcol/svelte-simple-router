<script lang="ts">
  import type { IRouter } from '~/models/router.model.js';

  import RouterView from '~/components/RouterView.svelte';
  import { active } from '~/router/active.svelte';

  const { router }: { router: IRouter } = $props();
</script>

<RouterView {router}>
  <span data-testid="span-error" use:active>error</span>

  <a data-testid="anchor-path" href="/home" use:active>path</a>
  <a data-testid="anchor-name" href="/other" data-name="home" use:active>name</a>

  <span data-testid="span-path" data-path="/home" use:active>path</span>
  <span data-testid="span-name" data-name="home" use:active>name</span>

  <div data-testid="param-path" data-path="/other" use:active={{ path: '/home' }}></div>
  <div data-testid="param-name" data-name="other" use:active={{ name: 'home' }}></div>

  <a data-testid="anchor-parent" href="/other" use:active>path-parent</a>
  <a data-testid="anchor-child" href="/other/target" use:active>path-child</a>
  <a data-testid="anchor-exact-parent" href="/other" use:active={{ exact: true }}>path-exact-parent</a>

  <a data-testid="anchor-name-sensitive" href="/home" use:active={{ name: 'Other', caseSensitive: true }}>path</a>
  <a data-testid="anchor-name-insensitive" href="/home" use:active={{ name: 'Other' }}>path</a>

  <a data-testid="anchor-class-active" href="/home" use:active={{ class: 'active' }}>path</a>
  <a data-testid="anchor-class-existing" href="/home" class="some-class" use:active={{ class: 'active' }}>path</a>

  <a data-testid="anchor-style-active" href="/home" use:active={{ style: { color: 'red' } }}>path</a>
  <a data-testid="anchor-style-existing" href="/home" style="color:blue; font-weight: bold;" use:active={{ style: { color: 'red' } }}>path</a>
</RouterView>
