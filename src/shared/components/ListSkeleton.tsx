import { StyleSheet, View } from 'react-native';
import { Skeleton } from './Skeleton';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { shadows } from '../theme/shadows';

interface Props {
  rows?: number;
}

/** Card-shaped placeholder rows shown while a list screen's first page loads. */
export function ListSkeleton({ rows = 5 }: Props) {
  return (
    <View style={styles.container}>
      {Array.from({ length: rows }).map((_, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.headerRow}>
            <Skeleton width="40%" height={14} />
            <Skeleton width={56} height={20} radius={radii.full} />
          </View>
          <Skeleton width="80%" height={16} style={styles.gapTop} />
          <Skeleton width="55%" height={12} style={styles.gapTop} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    ...shadows.soft,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gapTop: {
    marginTop: 10,
  },
});
