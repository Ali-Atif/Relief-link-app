import type { NetInfoState } from '@react-native-community/netinfo';

/** Shared rule for NGO sync + connectivity banner (NetInfo). */
export function isNetStateOnline(state: NetInfoState | null): boolean {
  if (state == null) {
    return true;
  }
  if (state.isConnected !== true) {
    return false;
  }
  if (state.isInternetReachable === false) {
    return false;
  }
  return true;
}
