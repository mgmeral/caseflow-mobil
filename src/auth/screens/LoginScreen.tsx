import { Shield } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { login } from '../../core/auth/session';
import { getDisplayMessage } from '../../core/api/http';
import { Button } from '../../shared/components/Button';
import { colors } from '../../shared/theme/colors';
import { radii } from '../../shared/theme/radii';
import { shadows } from '../../shared/theme/shadows';
import { spacing } from '../../shared/theme/spacing';
import { typography } from '../../shared/theme/typography';

export function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await login(username.trim(), password);
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <View style={styles.brandMark}>
            <Shield size={30} color={colors.onPrimary} strokeWidth={2} />
          </View>
          <Text style={styles.brandTitle}>CaseFlow Mobile</Text>
          <Text style={styles.brandSubtitle}>Sign in with your existing CaseFlow account.</Text>

          <View style={styles.card}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Username</Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="jane.doe"
                placeholderTextColor={colors.mutedLight}
                style={styles.input}
                testID="username-input"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.mutedLight}
                secureTextEntry
                style={styles.input}
                testID="password-input"
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button label="Sign In" onPress={handleSubmit} loading={isSubmitting} style={styles.submit} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  brandMark: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  brandTitle: {
    ...typography.display,
    fontSize: 26,
  },
  brandSubtitle: {
    ...typography.subtitle,
    marginTop: spacing.xxs,
    marginBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.lg,
    ...shadows.card,
  },
  field: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.label,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceMuted,
    fontSize: 15,
    color: colors.text,
  },
  submit: {
    marginTop: spacing.xs,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '500',
  },
});
