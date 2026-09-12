import * as LocalAuthentication from 'expo-local-authentication';

export async function getBiometricAvailability() {
  const [hardwareAvailable, enrolled, supportedTypes] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
    LocalAuthentication.supportedAuthenticationTypesAsync(),
  ]);

  return {
    available: hardwareAvailable && enrolled,
    hardwareAvailable,
    enrolled,
    supportedTypes,
  };
}
