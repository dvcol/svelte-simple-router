<script lang="ts">
  const { error }: { error: Error | any } = $props();
</script>

<div>
  <h1>Error</h1>
  <p style="color: red">{error?.message ?? error}</p>
  {#if error?.stack}
    <p style="color: red">{error.stack}</p>
  {/if}
</div>
