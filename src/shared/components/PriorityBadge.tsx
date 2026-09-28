import { StyleSheet, Text, View } from 'react-native';
import { getPriorityConfig } from '../theme/status';
import { fonts } from '../theme/fonts';

interface Props {
  priority?: string | null;
  size?: 'sm' | 'md';
}

export function PriorityBadge({ priority, size = 'sm' }: Props) {
  const config = getPriorityConfig(priority);
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          paddingHorizontal: isSmall ? 8 : 10,
          paddingVertical: isSmall ? 3 : 5,
        },
      ]}
    >
      <Text style={[styles.text, { color: config.text, fontSize: isSmall ? 11 : 12 }]} numberOfLines={1}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    ...fonts.semibold,
    letterSpacing: 0.2,
  },
});
