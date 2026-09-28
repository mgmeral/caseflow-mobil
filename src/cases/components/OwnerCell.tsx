import { StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../../shared/components/Avatar';
import { fonts } from '../../shared/theme/fonts';

interface Props {
  userName: string | null | undefined;
}

// caseflow-fe OwnerCell: avatar + name, or a red "Unassigned" pill.
export function OwnerCell({ userName }: Props) {
  if (!userName) {
    return (
      <View style={styles.unassigned}>
        <Text style={styles.unassignedText}>Unassigned</Text>
      </View>
    );
  }
  return (
    <View style={styles.row}>
      <Avatar name={userName} size={22} />
      <Text style={styles.name} numberOfLines={1}>{userName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  name: {
    ...fonts.medium,
    fontSize: 13,
    color: '#334155',
    flexShrink: 1,
  },
  unassigned: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  unassignedText: {
    ...fonts.medium,
    fontSize: 12,
    color: '#DC2626',
  },
});
