import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useState } from 'react';
import { logout } from '../../core/auth/session';
import { useSessionStore } from '../../core/auth/sessionStore';
import { useBiometricAvailability, useToggleBiometricPreference } from '../usecases/biometrics';
import { Screen } from '../../shared/components/Screen';
import { SectionCard } from '../../shared/components/SectionCard';
import { colors } from '../../shared/theme/colors';

export function ProfileScreen() {
  const user = useSessionStore((state) => state.user);
  const biometricEnabled = useSessionStore((state) => state.biometricEnabled);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const biometricQuery = useBiometricAvailability();
  const toggleBiometric = useToggleBiometricPreference();

  if (!user) {
    return null;
  }

  return (
    <Screen scrollable>
      <Text style={styles.title}>{user.fullName}</Text>
      <Text style={styles.subtitle}>{user.email}</Text>

      <SectionCard title="Access">
        <Text style={styles.row}>Role: {user.roleName}</Text>
        <Text style={styles.row}>Scope: {user.ticketScope}</Text>
        <Text style={styles.row}>Permissions: {user.permissionCodes.length}</Text>
      </SectionCard>

      <SectionCard title="Biometrics" subtitle="Stored as a local unlock preference only.">
        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.row}>Biometric unlock</Text>
            <Text style={styles.help}>{biometricQuery.data?.available ? 'Available on this device.' : 'Unavailable or not enrolled.'}</Text>
          </View>
          <Switch
            value={biometricEnabled}
            onValueChange={(value) => toggleBiometric(value)}
            disabled={!biometricQuery.data?.available}
          />
        </View>
      </SectionCard>

      <Pressable
        style={[styles.logoutButton, isLoggingOut && { opacity: 0.7 }]}
        onPress={async () => {
          setIsLoggingOut(true);
          await logout();
          setIsLoggingOut(false);
        }}
      >
        <Text style={styles.logoutLabel}>{isLoggingOut ? 'Signing out…' : 'Sign Out'}</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.muted,
    marginTop: 6,
    marginBottom: 18,
  },
  row: {
    color: colors.text,
    marginBottom: 8,
  },
  help: {
    color: colors.muted,
    fontSize: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutButton: {
    backgroundColor: colors.danger,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutLabel: {
    color: colors.onPrimary,
    fontWeight: '600',
  },
});
