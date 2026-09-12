import { useQuery } from '@tanstack/react-query';
import { useSessionStore } from '../../core/auth/sessionStore';
import { getBiometricAvailability } from '../../core/biometrics/biometrics';

export function useBiometricAvailability() {
  return useQuery({
    queryKey: ['biometric-availability'],
    queryFn: getBiometricAvailability,
    staleTime: Infinity,
  });
}

export function useToggleBiometricPreference() {
  const setBiometricEnabled = useSessionStore((state) => state.setBiometricEnabled);
  return (enabled: boolean) => setBiometricEnabled(enabled);
}
