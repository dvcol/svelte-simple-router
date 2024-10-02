<script lang="ts">
  import type { RouterOptions } from '~';

  let {
    options = $bindable({
      listen: 'history',
      base: '/svelte-simple-router',
      hash: true,
      strict: false,
      failOnNotFound: false,
      metaAsState: false,
      nameAsTitle: false,
      followGuardRedirects: true,
      caseSensitive: false,
      beforeEach: (from, to) => {
        console.info('Option before each', { from, to });
      },
      onStart: (from, to) => {
        console.info('Option on start', { from, to });
      },
      onEnd: (from, to) => {
        console.info('Option on end', { from, to });
      },
      onError: (err, { from, to, route }) => {
        console.error('Option on error', { err, from, to, route });
      },
    }),
    stripQuery = $bindable(false),
    stripHash = $bindable(false),
    stripTrailingHash = $bindable(false),
  }: { options: RouterOptions<Routes> } = $props();

  const configs = $derived(Object.entries(options).filter(([_, v]) => typeof v === 'string' || typeof v === 'boolean')) as [
    keyof RouterOptions<Routes>,
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
</script>

<div class="row">
  <div class="column">
    <h3>Options</h3>
    <table class="options">
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {#each configs as [key, value]}
          <tr title={title[key]}>
            <td>{key}</td>
            <td>
              {#if key === 'base'}
                <input type="text" bind:value={options[key]} />
              {:else if key === 'listen'}
                <select bind:value={options[key]}>
                  <option value={'history'}>History</option>
                  <option value={'navigation'}>Navigation</option>
                  <option value={true}>True</option>
                  <option value={false}>False</option>
                </select>
              {:else if typeof value === 'boolean'}
                <input type="checkbox" bind:checked={options[key]} />
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<div class="row">
  <div class="column">
    <h3>External Push state</h3>
    <table class="options">
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><label for="stripQuery">Strip Query</label></td>
          <td><input id="stripQuery" type="checkbox" bind:checked={stripQuery} /></td>
        </tr>
        <tr>
          <td><label for="stripHash">Strip Hash</label></td>
          <td><input id="stripHash" type="checkbox" bind:checked={stripHash} /></td>
        </tr>
        <tr>
          <td><label for="stripTrailingHash">Strip Trailing Hash</label></td>
          <td><input id="stripTrailingHash" type="checkbox" bind:checked={stripTrailingHash} /></td>
        </tr>
        <tr>
          <td><label for="input">External Push State</label></td>
          <td>
            <textarea rows="2" id="input" bind:value={input}></textarea>
          </td>
        </tr>
        <tr>
          <td></td>
          <td>
            <button onclick={onInputButton}>Push State</button>
          </td>
        </tr>
      </tbody>
    </table>
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
    background-color: color-mix(in srgb, transparent, black 20%);
    border-radius: 0.5rem;
  }

  tbody tr {
    td {
      padding: 0.25rem 0.75rem;

      &:not(:first-child) {
        text-align: center;
      }
    }

    &:active,
    &:hover {
      background-color: color-mix(in srgb, transparent, black 40%);
    }
  }
</style>
