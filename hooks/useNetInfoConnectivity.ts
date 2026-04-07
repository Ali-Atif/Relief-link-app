import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

import { isNetStateOnline } from '../utils/netInfoOnline';

/** Live online/offline from NetInfo — same rules as `getIsOnline` in `ngoReportsService`. */
export function useNetInfoConnectivity(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let mounted = true;

    void NetInfo.fetch().then((state) => {
      if (mounted) {
        setIsOnline(isNetStateOnline(state));
      }
    });

    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      if (mounted) {
        setIsOnline(isNetStateOnline(state));
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return isOnline;
}
