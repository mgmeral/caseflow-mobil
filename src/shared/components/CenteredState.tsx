import { AlertCircle } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { colors } from '../theme/colors';

interface Props {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function CenteredState({ title, actionLabel, onAction }: Props) {
  const isError = Boolean(actionLabel);

  return (
    <View style={styles.container}>
      {isError ? (
        <View style={styles.iconWrap}>
          <AlertCircle size={24} color={colors.errorText} strokeWidth={1.75} />
        </View>
      ) : (
        <ActivityIndicator color={colors.primary} size="large" style={styles.spinner} />
      )}
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="secondary" size="sm" style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  spinner: {
    marginBottom: 14,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.errorMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  action: {
    marginTop: 16,
  },
});
