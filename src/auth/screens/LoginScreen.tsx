import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { login } from '../../core/auth/session';
import { getDisplayMessage } from '../../core/api/http';
import { Button } from '../../shared/components/Button';
import { colors } from '../../shared/theme/colors';
import { fonts } from '../../shared/theme/fonts';
import { floatingSurface, inputSurface } from '../../shared/theme/inputs';
import { spacing } from '../../shared/theme/spacing';

const logo = require('../../../assets/brand/logo-full.png');

// Mirrors caseflow-fe's LoginPage: a floating card on the soft blue wash, the
// full CaseFlow logo, "Sign in to your account", and plain labelled inputs.
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
    <LinearGradient colors={['#F4F7FB', '#ECF2F9']} style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.container}>
            <View style={styles.card}>
              <View style={styles.brand}>
                <Image source={logo} style={styles.logo} resizeMode="contain" accessibilityLabel="CaseFlow" />
                <Text style={styles.brandSubtitle}>Sign in to your account</Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Username</Text>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="username"
                  placeholder="admin"
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
                  autoComplete="current-password"
                  placeholder="••••••••"
                  placeholderTextColor={colors.mutedLight}
                  secureTextEntry
                  onSubmitEditing={handleSubmit}
                  style={styles.input}
                  testID="password-input"
                />
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Button label="Sign In" onPress={handleSubmit} loading={isSubmitting} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  // `.surface-floating`, max-w-sm, p-8
  card: {
    ...floatingSurface,
    width: '100%',
    maxWidth: 384,
    padding: spacing.xxxl,
    gap: spacing.lg,
  },
  brand: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  // h-44 with -mb-8: the image has generous transparent padding.
  logo: {
    width: '100%',
    height: 176,
    marginBottom: -32,
  },
  brandSubtitle: {
    ...fonts.regular,
    fontSize: 14,
    color: '#64748B',
  },
  field: {
    gap: 4,
  },
  fieldLabel: {
    ...fonts.medium,
    fontSize: 12,
    color: '#334155',
  },
  input: inputSurface,
  error: {
    ...fonts.regular,
    fontSize: 12,
    color: '#DC2626',
  },
});
