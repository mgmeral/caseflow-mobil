import { useEffect, useMemo, useState } from 'react';
import { restoreSession } from './session';
import { useSessionStore } from './sessionStore';

export function useBootstrapSession() {
  const isHydrated = useSessionStore((state) => state.isHydrated);
  const hasRefreshToken = useSessionStore((state) => Boolean(state.refreshToken));
  const status = useSessionStore((state) => state.status);
  const [hasBootstrapped, setHasBootstrapped] = useState(false);

  useEffect(() => {
    if (!isHydrated || hasBootstrapped) {
      return;
    }

    let active = true;

    const bootstrap = async () => {
      if (hasRefreshToken) {
        await restoreSession();
      }
      if (active) {
        setHasBootstrapped(true);
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, [hasBootstrapped, hasRefreshToken, isHydrated]);

  return useMemo(() => ({
    isReady: isHydrated && hasBootstrapped && status !== 'loading',
  }), [hasBootstrapped, isHydrated, status]);
}
