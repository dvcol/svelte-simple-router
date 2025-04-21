<script lang="ts">
  import type { RouterOptions } from '~/models/router.model.js';

  import { NeoButton, NeoCard, NeoCheckbox, NeoInput, NeoSelect, NeoTextarea } from '@dvcol/neo-svelte';

  let {
    options = $bindable({
      listen: 'history',
      syncUpdate: 'replace',
      syncDebounce: 0,
      base: '/svelte-simple-router',
      hash: true,
      strict: false,
      failOnNotFound: false,
      metaAsState: false,
      nameAsTitle: false,
      followGuardRedirects: true,
      caseSensitive: false,
      beforeEach: (navigation) => {
        console.info('Option before each', navigation);
      },
      onStart: (navigation) => {
        console.info('Option on start', navigation);
      },
      onEnd: (navigation, resolved) => {
        console.info('Option on end', { navigation, resolved });
      },
      onError: (err, navigation) => {
        console.error('Option on error', { err, ...navigation });
      },
    }),
    stripQuery = $bindable(false),
    stripHash = $bindable(false),
    stripTrailingHash = $bindable(false),
    resolve = $bindable(false),
  }: { options: RouterOptions; stripQuery?: boolean; stripHash?: boolean; stripTrailingHash?: boolean; resolve?: boolean } = $props();

  const configs = $derived(Object.entries(options).filter(([_, v]) => typeof v === 'string' || typeof v === 'boolean')) as [
    keyof RouterOptions,
    string | boolean,
  ][];

  let input = $state(`${options?.base ?? ''}${options?.hash ? '/#' : ''}/hello`);
  const onInputButton = () => {
    console.info('onInputButton', input);
    window.history.pushState({}, '', window.location.origin + input);
  };

  const title = {
    listen: `In 'navigation' or 'history' mode, the router listen to popstate or navigation events. If both demo routers are not in the same mode (e.g., 'hash' or 'path'), routing conflicts may occur.`,
    hash: `In 'navigation' or 'history' mode, the router listen to popstate or navigation events. If both demo routers are not in the same mode (e.g., 'hash' or 'path'), routing conflicts may occur.`,
  };

  // convert pascal case to title case
  const toTitleCase = (str: string) => str.replace(/([A-Z])/g, ' $1').replace(/^./, _str => _str.toUpperCase());
</script>

<div class="row">
  <div class="column">
    <NeoCard rounded>
      {#snippet header()}
        <h4>Options</h4>
      {/snippet}

      <table class="options">
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {#each configs as [key, value] (key)}
            <tr title={title[key]}>
              <td>{toTitleCase(key)}</td>
              <td>
                {#if key === 'base'}
                  <NeoInput elevation="0" rounded type="text" bind:value={options[key]} />
                {:else if key === 'listen'}
                  <NeoSelect
                    pressed
                    bind:value={options[key]}
                    listProps={{ nullable: false }}
                    options={[
                      { label: 'History', value: 'history' },
                      { label: 'Navigation', value: 'navigation' },
                      { label: 'True', value: true },
                      { label: 'False', value: false },
                    ]}
                  />
                {:else if key === 'syncUpdate'}
                  <NeoSelect
                    pressed
                    bind:value={options[key]}
                    listProps={{ nullable: false }}
                    options={[
                      { label: 'Replace', value: 'replace' },
                      { label: 'Push', value: 'push' },
                      { label: 'False', value: false },
                    ]}
                  />
                {:else if typeof value === 'boolean'}
                  <NeoCheckbox rounded bind:checked={options[key]} />
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </NeoCard>
  </div>
</div>

<div class="row">
  <div class="column">
    <NeoCard rounded>
      {#snippet header()}
        <h4>External Push state</h4>
      {/snippet}

      <div class="row">
        <NeoCheckbox rounded label="Resolve" bind:checked={resolve} />
        <NeoCheckbox rounded label="Strip Query" bind:checked={stripQuery} />
        <NeoCheckbox rounded label="Strip Hash" bind:checked={stripHash} />
        <NeoCheckbox rounded label="Strip Trailing Hash" bind:checked={stripTrailingHash} />
      </div>

      <NeoTextarea label="External Push state" pressed rows={2} id="input" containerProps={{ style: 'display: flex' }} bind:value={input} />

      <NeoButton onclick={onInputButton} style="margin-inline: auto; margin-top: 1.75rem;">Push State</NeoButton>
    </NeoCard>
  </div>
</div>

<style lang="scss">
  .row {
    display: flex;
    flex-direction: row;
    gap: 1rem;
  }

  .column {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
  }

  .options {
    padding: 1rem;
    border-radius: 0.5rem;
  }

  tbody tr {
    td {
      padding: 0.25rem 0.75rem;

      &:not(:first-child) {
        text-align: center;
      }
    }
  }
</style>
