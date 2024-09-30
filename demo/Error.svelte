<script lang="ts">
  const { error }: { error: Error | any } = $props();
</script>

<div>
  <h1>Error</h1>
  <p class="error">{error?.message ?? error}</p>
  {#if error?.stack}
    <p class="error">{error.stack}</p>
  {/if}
</div>

<style>
  .error {
    max-width: 30rem;
    color: red;
  }
</style>
