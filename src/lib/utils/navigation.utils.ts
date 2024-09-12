import type { Route, RouteName } from '~/models/route.model.js';

export const routeToHistoryState = <Name extends RouteName = string>(
  route: Route<Name>,
  {
    metaAsState,
    nameAsTitle,
  }: {
    metaAsState?: boolean;
    nameAsTitle?: boolean;
  },
) => {
  const state = metaAsState ? { ...route.meta } : undefined;
  const title = nameAsTitle ? route.name?.toString() : undefined;
  return { state, title };
};
