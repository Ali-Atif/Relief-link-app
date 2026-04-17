import type { NavigationState, PartialState } from '@react-navigation/native';

/** Deepest focused route name (handles nested navigators if added later). */
export function getActiveRouteName(
  state: NavigationState | PartialState<NavigationState> | undefined,
): string | undefined {
  if (!state?.routes?.length) return undefined;
  const index = state.index ?? state.routes.length - 1;
  const route = state.routes[index];
  if (!route) return undefined;
  if (route.state) {
    return getActiveRouteName(route.state as NavigationState);
  }
  return route.name;
}
