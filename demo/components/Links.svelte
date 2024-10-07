<script lang="ts">
  import GithubSvg from './Github.svelte';
</script>

<a href="https://github.com/dvcol/svelte-simple-router" class="button" tabindex="0">
  <GithubSvg />
  Github repository
</a>

<style lang="scss">
  .button {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    padding: 0.5rem 1rem;
    color: white;
    text-decoration: none;
    background-color: rgb(0 0 0 / 20%);
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background-color 300ms ease;

    &:active,
    &:hover {
      background-color: rgb(0 0 0 / 40%);
    }
  }
</style>
