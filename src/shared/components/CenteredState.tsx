import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function CenteredState({ title, actionLabel, onAction }: Props) {
  return (
    <View style={styles.container}>
      {!actionLabel ? <ActivityIndicator color={colors.primary} style={{ marginBottom: 12 }} /> : null}
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
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
  title: {
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.onPrimary,
    fontWeight: '600',
  },
});
