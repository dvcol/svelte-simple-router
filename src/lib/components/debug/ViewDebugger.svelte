<script lang="ts">
  import { useView } from '~/router/use-router.svelte';

  const view = useView();
  const name = $derived(view.name);
  const loading = $derived(view.loading);
  const error = $derived(view.error);
</script>

<div class="debug">
  <h3>View - {view?.id}</h3>
  <br />
  <div>Name - {name}</div>
  <div>Loading - {loading}</div>
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
    background-color: color-mix(in srgb, transparent, white 10%);
    border-radius: 0.5rem;

    h3 {
      margin-top: 0;
    }
  }

  .error {
    color: red;
  }
</style>
