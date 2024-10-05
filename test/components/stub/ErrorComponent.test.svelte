<script lang="ts">
  const { error }: { error: Error | any } = $props();
</script>

<div data-testid="error-component">
  <h1>Error Component</h1>
  {#if error}
    <p data-testid="error-message">{error?.message ?? error}</p>
  {/if}
</div>
