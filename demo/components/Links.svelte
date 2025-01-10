<script lang="ts">
  import { NeoButton, NeoThemeSelector } from '@dvcol/neo-svelte';

  import GithubSvg from './Github.svelte';
</script>

<NeoThemeSelector>
  <NeoButton href="https://github.com/dvcol/svelte-simple-router" target="_blank">
    {#snippet icon()}
      <GithubSvg />
    {/snippet}
    Github
  </NeoButton>
</NeoThemeSelector>
