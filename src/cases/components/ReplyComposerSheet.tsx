import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { X } from 'lucide-react-native';
import { Button } from '../../shared/components/Button';
import { colors } from '../../shared/theme/colors';
import { radii } from '../../shared/theme/radii';
import { spacing } from '../../shared/theme/spacing';
import { typography } from '../../shared/theme/typography';

interface Props {
  visible: boolean;
  defaultSubject: string;
  toAddress?: string | null;
  isSending: boolean;
  errorMessage?: string | null;
  onSend: (subject: string, body: string) => void;
  onClose: () => void;
}

export function ReplyComposerSheet({ visible, defaultSubject, toAddress, isSending, errorMessage, onSend, onClose }: Props) {
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState('');

  useEffect(() => {
    if (visible) {
      setSubject(defaultSubject);
      setBody('');
    }
  }, [visible, defaultSubject]);

  const canSend = subject.trim().length > 0 && body.trim().length > 0 && !isSending;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Reply</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={20} color={colors.muted} />
            </Pressable>
          </View>

          {toAddress ? <Text style={styles.toLine}>To: {toAddress}</Text> : null}

          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Subject</Text>
            <TextInput value={subject} onChangeText={setSubject} style={styles.subjectInput} />

            <Text style={[styles.label, styles.bodyLabel]}>Message</Text>
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="Type your reply…"
              placeholderTextColor={colors.mutedLight}
              style={styles.bodyInput}
              multiline
              textAlignVertical="top"
            />

            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
          </ScrollView>

          <View style={styles.footer}>
            <Button label="Cancel" variant="secondary" onPress={onClose} style={styles.footerButton} />
            <Button label="Send" onPress={() => onSend(subject.trim(), body.trim())} disabled={!canSend} loading={isSending} style={styles.footerButton} />
          </View>
        </View>
      </KeyboardAvoidingView>
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
    maxHeight: '90%',
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingBottom: spacing.xs,
  },
  title: {
    ...typography.title,
    fontSize: 17,
  },
  toLine: {
    ...typography.caption,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  body: {
    paddingHorizontal: spacing.lg,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  bodyLabel: {
    marginTop: spacing.md,
  },
  subjectInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: 14,
  },
  bodyInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.sm,
    minHeight: 160,
    color: colors.text,
    fontSize: 14,
  },
  error: {
    color: colors.errorText,
    fontSize: 13,
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  footerButton: {
    flex: 1,
  },
});
