<script lang="ts">
  import { useRouter } from '~/router/hooks.svelte.js';

  const router = useRouter();
  const route = $derived(router?.route);
  const location = $derived(router?.location);
  const meta = $derived(location?.meta);
  const title = $derived(location?.title);
  const error = $derived<any>(router?.error);
</script>

<div class="debug">
  <h3>Router - {router?.id}</h3>
  <br />
  <div>Location - {location?.path}</div>
  <div>Title - {title}</div>
  <div>Params - {JSON.stringify(location?.params, undefined, 2)}</div>
  <div>Query - {JSON.stringify(location?.query, undefined, 2)}</div>
  <div>Wildcards - {JSON.stringify(location?.wildcards, undefined, 2)}</div>
  <br />
  <div>Route - {route?.name}</div>
  <div>Meta - {JSON.stringify(meta, undefined, 2)}</div>
  <div>Props - {JSON.stringify(route?.props, undefined, 2)}</div>

  <div>Parent - {route?.parent?.name ?? route?.parent?.path}</div>
  <div>
    Children - {JSON.stringify(
      route?.children?.map(r => ({ name: r.name, path: r.path })),
      undefined,
      2,
    )}
  </div>
  <br />
  {#if error}
    <div>
      <h1>Navigation Error</h1>
      <p class="error">{error?.message ?? error}</p>
      {#if error?.stack}
        <p class="error">{error.stack}</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .debug {
    width: fit-content;
    margin: 1rem 0;
    padding: 1rem;
    border-radius: 0.5rem;

    h3 {
      margin-top: 0;
    }
  }

  .error {
    color: red;
  }
</style>
