import { useNavigation } from '@react-navigation/native';
import { BarChart2, BellRing, ChevronRight, FileText, Fingerprint, LogOut, ShieldCheck, SlidersHorizontal, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { hasPermission } from '../../shared/utils/permissions';
import { logout } from '../../core/auth/session';
import { useSessionStore } from '../../core/auth/sessionStore';
import { useBiometricAvailability, useToggleBiometricPreference } from '../usecases/biometrics';
import { Avatar } from '../../shared/components/Avatar';
import { Button } from '../../shared/components/Button';
import { Screen } from '../../shared/components/Screen';
import { SectionCard } from '../../shared/components/SectionCard';
import { colors } from '../../shared/theme/colors';
import { spacing } from '../../shared/theme/spacing';
import { typography } from '../../shared/theme/typography';

export function ProfileScreen() {
  const user = useSessionStore((state) => state.user);
  const biometricEnabled = useSessionStore((state) => state.biometricEnabled);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const biometricQuery = useBiometricAvailability();
  const toggleBiometric = useToggleBiometricPreference();
  const navigation = useNavigation<any>();

  if (!user) {
    return null;
  }

  const permissions = user.permissionCodes;
  const adminLinks: { route: string; label: string; description: string; icon: LucideIcon }[] = [
    ...(hasPermission(permissions, 'REPORT_VIEW')
      ? [{ route: 'Reports', label: 'Reports', description: 'Ticket volume per customer', icon: BarChart2 }]
      : []),
    ...(hasPermission(permissions, 'EMAIL_CONFIG_VIEW') || hasPermission(permissions, 'EMAIL_CONFIG_MANAGE')
      ? [{ route: 'Templates', label: 'Mail templates', description: 'Reply and notification templates', icon: FileText }]
      : []),
    ...(hasPermission(permissions, 'INTEGRATION_CONFIG_MANAGE')
      ? [{ route: 'Channels', label: 'Notification channels', description: 'Slack and Teams webhooks', icon: BellRing }]
      : []),
  ];

  return (
    <Screen scrollable>
      <View style={styles.headerRow}>
        <Avatar name={user.fullName} size={56} />
        <View style={styles.headerText}>
          <Text style={styles.title}>{user.fullName}</Text>
          <Text style={styles.subtitle}>{user.email}</Text>
        </View>
      </View>

      <SectionCard title="Access" icon={ShieldCheck}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Role</Text>
          <Text style={styles.rowValue}>{user.roleName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Scope</Text>
          <Text style={styles.rowValue}>{user.ticketScope}</Text>
        </View>
        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.rowLabel}>Permissions</Text>
          <Text style={styles.rowValue}>{user.permissionCodes.length}</Text>
        </View>
      </SectionCard>

      {adminLinks.length > 0 ? (
        <SectionCard title="Administration" icon={SlidersHorizontal}>
          {adminLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <Pressable
                key={link.route}
                style={({ pressed }) => [styles.linkRow, index === adminLinks.length - 1 && styles.rowLast, pressed && styles.linkPressed]}
                onPress={() => navigation.navigate(link.route)}
              >
                <Icon size={18} color={colors.primary} />
                <View style={styles.toggleText}>
                  <Text style={styles.rowValue}>{link.label}</Text>
                  <Text style={styles.help}>{link.description}</Text>
                </View>
                <ChevronRight size={18} color={colors.mutedLight} />
              </Pressable>
            );
          })}
        </SectionCard>
      ) : null}

      <SectionCard title="Biometrics" subtitle="Stored as a local unlock preference only." icon={Fingerprint}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleText}>
            <Text style={styles.rowValue}>Biometric unlock</Text>
            <Text style={styles.help}>{biometricQuery.data?.available ? 'Available on this device.' : 'Unavailable or not enrolled.'}</Text>
          </View>
          <Switch
            value={biometricEnabled}
            onValueChange={(value) => toggleBiometric(value)}
            disabled={!biometricQuery.data?.available}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.surface}
          />
        </View>
      </SectionCard>

      <Button
        label={isLoggingOut ? 'Signing out…' : 'Sign Out'}
        variant="danger"
        loading={isLoggingOut}
        icon={!isLoggingOut ? <LogOut size={16} color={colors.onDanger} /> : undefined}
        onPress={async () => {
          setIsLoggingOut(true);
          await logout();
          setIsLoggingOut(false);
        }}
        style={styles.logoutButton}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.display,
    fontSize: 22,
  },
  subtitle: {
    ...typography.subtitle,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  rowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  rowLabel: {
    ...typography.caption,
  },
  rowValue: {
    ...typography.bodyStrong,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  linkPressed: {
    opacity: 0.6,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  toggleText: {
    flex: 1,
    gap: 2,
  },
  help: {
    ...typography.caption,
  },
  logoutButton: {
    marginTop: spacing.xs,
  },
});
