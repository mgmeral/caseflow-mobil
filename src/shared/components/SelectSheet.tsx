import { Check, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme/colors';
import { inputSurface } from '../theme/inputs';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export interface SelectSheetOption {
  value: string;
  label: string;
  description?: string;
}

interface Props {
  visible: boolean;
  title: string;
  options: SelectSheetOption[];
  selectedValue?: string | null;
  onSelect: (value: string) => void;
  onClose: () => void;
  emptyLabel?: string;
  /** Shows a search box that filters options by label. */
  searchPlaceholder?: string;
}

export function SelectSheet({ visible, title, options, selectedValue, onSelect, onClose, emptyLabel, searchPlaceholder }: Props) {
  const [query, setQuery] = useState('');
  useEffect(() => {
    if (visible) setQuery('');
  }, [visible]);
  const needle = query.trim().toLowerCase();
  const shown = needle ? options.filter((option) => option.label.toLowerCase().includes(needle)) : options;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={20} color={colors.muted} />
            </Pressable>
          </View>
          {searchPlaceholder ? (
            <View style={styles.search}>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={searchPlaceholder}
                placeholderTextColor={colors.mutedLight}
                autoCorrect={false}
                autoCapitalize="none"
                style={inputSurface}
              />
            </View>
          ) : null}
          <ScrollView style={styles.list} bounces={false} keyboardShouldPersistTaps="handled">
            {shown.length === 0 ? (
              <Text style={styles.empty}>{needle ? 'No matches.' : emptyLabel ?? 'No options available.'}</Text>
            ) : (
              shown.map((option) => {
                const isSelected = option.value === selectedValue;
                return (
                  <Pressable
                    key={option.value}
                    style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                    onPress={() => onSelect(option.value)}
                  >
                    <View style={styles.optionText}>
                      <Text style={styles.optionLabel}>{option.label}</Text>
                      {option.description ? <Text style={styles.optionDescription}>{option.description}</Text> : null}
                    </View>
                    {isSelected ? <Check size={18} color={colors.primary} /> : null}
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    maxHeight: '70%',
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  title: {
    ...typography.title,
    fontSize: 17,
  },
  search: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.sm,
  },
  empty: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: spacing.xxl,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
  },
  optionPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    ...typography.bodyStrong,
  },
  optionDescription: {
    ...typography.caption,
  },
});
