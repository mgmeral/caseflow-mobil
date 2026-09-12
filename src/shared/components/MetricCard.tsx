import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  label: string;
  value: number;
}

export function MetricCard({ label, value }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minWidth: '47%',
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  label: {
    color: colors.muted,
    fontSize: 13,
  },
  value: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '700',
    marginTop: 8,
  },
});
