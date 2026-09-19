import { useState } from 'react';
import { MessageSquareText, Send } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAddNote, useNotes } from '../../notes/hooks/useNotes';
import { Badge } from '../../shared/components/Badge';
import type { BadgeVariant } from '../../shared/theme/status';
import { SectionCard } from '../../shared/components/SectionCard';
import { colors } from '../../shared/theme/colors';
import { radii } from '../../shared/theme/radii';
import { spacing } from '../../shared/theme/spacing';
import { typography } from '../../shared/theme/typography';
import type { NoteType } from '../../types/api';

const NOTE_TYPE_VARIANT: Record<NoteType, BadgeVariant> = {
  INFO: 'info',
  INVESTIGATION: 'warning',
  ESCALATION: 'error',
  INTERNAL: 'default',
};

interface Props {
  caseId: string;
  canAddNote: boolean;
}

export function NotesSection({ caseId, canAddNote }: Props) {
  const notesQuery = useNotes(caseId);
  const addNote = useAddNote(caseId);
  const [content, setContent] = useState('');

  const notes = notesQuery.data ?? [];

  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    addNote.mutate({ content: trimmed, type: 'INTERNAL' }, { onSuccess: () => setContent('') });
  };

  return (
    <SectionCard title="Notes" subtitle="Internal notes — not visible to the customer." icon={MessageSquareText}>
      {notesQuery.isLoading ? (
        <ActivityIndicator color={colors.primary} />
      ) : notes.length === 0 ? (
        <Text style={styles.empty}>No notes yet.</Text>
      ) : (
        notes.map((note, index) => (
          <View key={note.id} style={[styles.noteRow, index === 0 && styles.noteRowFirst]}>
            <View style={styles.noteHeader}>
              <Text style={styles.noteAuthor}>{note.createdByUser?.displayName ?? 'Unknown'}</Text>
              <Badge label={note.type} variant={NOTE_TYPE_VARIANT[note.type] ?? 'default'} />
            </View>
            <Text style={styles.noteContent}>{note.content}</Text>
            <Text style={styles.noteTimestamp}>{note.createdAt}</Text>
          </View>
        ))
      )}

      {canAddNote ? (
        <View style={styles.composer}>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Add an internal note…"
            placeholderTextColor={colors.mutedLight}
            style={styles.composerInput}
            multiline
          />
          <Pressable
            style={[styles.sendButton, (!content.trim() || addNote.isPending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!content.trim() || addNote.isPending}
          >
            {addNote.isPending ? <ActivityIndicator color={colors.onPrimary} size="small" /> : <Send size={16} color={colors.onPrimary} />}
          </Pressable>
        </View>
      ) : null}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  empty: {
    ...typography.body,
    color: colors.muted,
  },
  noteRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    paddingTop: spacing.md,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  noteRowFirst: {
    borderTopWidth: 0,
    paddingTop: 0,
    marginTop: 0,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noteAuthor: {
    ...typography.bodyStrong,
    fontSize: 13,
  },
  noteContent: {
    ...typography.body,
  },
  noteTimestamp: {
    ...typography.caption,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    paddingTop: spacing.md,
  },
  composerInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: 40,
    maxHeight: 100,
    color: colors.text,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
