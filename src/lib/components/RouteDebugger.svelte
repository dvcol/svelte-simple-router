<script lang="ts">
  import { useRouter } from '~/router/use-router.svelte.js';

  const router = useRouter();
  const route = $derived(router?.route);
  const location = $derived(router?.location);
</script>

<div>Router - {router?.id}</div>
<br />
<div>Location - {location?.path}</div>
<div>Params - {JSON.stringify(location?.params, undefined, 2)}</div>
<div>Wildcards - {JSON.stringify(location?.wildcards, undefined, 2)}</div>
<br />
<div>Route - {route?.name}</div>
<div>Meta - {JSON.stringify(route?.meta, undefined, 2)}</div>
<div>Parent - {route?.parent?.name ?? route?.parent?.path}</div>
<div>
  Children - {JSON.stringify(
    route?.children?.map(r => ({ name: r.name, path: r.path })),
    undefined,
    2,
  )}
</div>
