import { useMemo, useState } from 'react';
import { Plus, Tag as TagIcon, X } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useActiveTags, useAddTicketTag, useRemoveTicketTag, useTicketTags } from '../../tags/hooks/useTags';
import { SectionCard } from '../../shared/components/SectionCard';
import { SelectSheet } from '../../shared/components/SelectSheet';
import { colors } from '../../shared/theme/colors';
import { radii } from '../../shared/theme/radii';
import { spacing } from '../../shared/theme/spacing';
import { typography } from '../../shared/theme/typography';

interface Props {
  caseId: string;
  canManageTags: boolean;
}

export function TagsSection({ caseId, canManageTags }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const ticketTagsQuery = useTicketTags(caseId);
  const activeTagsQuery = useActiveTags(sheetOpen);
  const addTag = useAddTicketTag(caseId);
  const removeTag = useRemoveTicketTag(caseId);

  const ticketTags = ticketTagsQuery.data ?? [];
  const appliedTagIds = new Set(ticketTags.map((t) => t.tagId));
  const availableOptions = useMemo(
    () => (activeTagsQuery.data ?? []).filter((tag) => !appliedTagIds.has(tag.id)).map((tag) => ({ value: String(tag.id), label: tag.name })),
    [activeTagsQuery.data, ticketTags],
  );

  if (!canManageTags && ticketTags.length === 0 && !ticketTagsQuery.isLoading) {
    return null;
  }

  return (
    <SectionCard title="Tags" icon={TagIcon}>
      {ticketTagsQuery.isLoading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <View style={styles.chipRow}>
          {ticketTags.map((tag) => (
            <View key={tag.tagId} style={[styles.chip, tag.tagColor ? { backgroundColor: `${tag.tagColor}22`, borderColor: tag.tagColor } : null]}>
              <Text style={styles.chipLabel}>{tag.tagName}</Text>
              {canManageTags ? (
                <Pressable onPress={() => removeTag.mutate(tag.tagId)} hitSlop={6} style={styles.chipRemove}>
                  <X size={12} color={colors.muted} />
                </Pressable>
              ) : null}
            </View>
          ))}
          {canManageTags ? (
            <Pressable style={styles.addChip} onPress={() => setSheetOpen(true)}>
              <Plus size={13} color={colors.primary} />
              <Text style={styles.addChipLabel}>Add tag</Text>
            </Pressable>
          ) : null}
          {ticketTags.length === 0 && !canManageTags ? <Text style={styles.empty}>No tags.</Text> : null}
        </View>
      )}

      <SelectSheet
        visible={sheetOpen}
        title="Add Tag"
        options={availableOptions}
        emptyLabel={activeTagsQuery.isLoading ? 'Loading…' : 'No more tags to add.'}
        onSelect={(value) => {
          addTag.mutate(Number(value));
          setSheetOpen(false);
        }}
        onClose={() => setSheetOpen(false)}
      />
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.neutralMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  chipLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text,
  },
  chipRemove: {
    marginLeft: 2,
  },
  addChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  addChipLabel: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  empty: {
    ...typography.body,
    color: colors.muted,
  },
});
