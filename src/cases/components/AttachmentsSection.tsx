import { useState } from 'react';
import { Download, FileText as FileIcon, Paperclip } from 'lucide-react-native';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SectionCard } from '../../shared/components/SectionCard';
import { colors } from '../../shared/theme/colors';
import { radii } from '../../shared/theme/radii';
import { spacing } from '../../shared/theme/spacing';
import { typography } from '../../shared/theme/typography';
import { downloadAndShareAttachment } from '../../shared/utils/attachments';
import type { AttachmentMetadataResponse } from '../../types/api';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Props {
  attachments: AttachmentMetadataResponse[];
}

export function AttachmentsSection({ attachments }: Props) {
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  if (attachments.length === 0) {
    return null;
  }

  const handleDownload = async (attachment: AttachmentMetadataResponse) => {
    setDownloadingId(attachment.id);
    try {
      await downloadAndShareAttachment(attachment.downloadPath, attachment.fileName);
    } catch {
      Alert.alert('Download failed', `Could not download "${attachment.fileName}". Please try again.`);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <SectionCard title="Attachments" icon={Paperclip}>
      {attachments.map((attachment, index) => (
        <View key={attachment.id} style={[styles.row, index === 0 && styles.rowFirst]}>
          <View style={styles.iconWrap}>
            <FileIcon size={16} color={colors.muted} />
          </View>
          <View style={styles.info}>
            <Text style={styles.fileName} numberOfLines={1}>
              {attachment.fileName}
            </Text>
            <Text style={styles.meta}>{formatSize(attachment.size)}</Text>
          </View>
          <Pressable onPress={() => handleDownload(attachment)} disabled={downloadingId === attachment.id} hitSlop={8}>
            {downloadingId === attachment.id ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Download size={18} color={colors.primary} />
            )}
          </Pressable>
        </View>
      ))}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  rowFirst: {
    borderTopWidth: 0,
    paddingTop: 0,
    marginTop: 0,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    backgroundColor: colors.neutralMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  fileName: {
    ...typography.bodyStrong,
    fontSize: 13,
  },
  meta: {
    ...typography.caption,
  },
});
