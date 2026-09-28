import { useNavigation, useRoute } from '@react-navigation/native';
import { Eye, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getDisplayMessage } from '../../core/api/http';
import { useSessionStore } from '../../core/auth/sessionStore';
import { Badge } from '../../shared/components/Badge';
import { Button } from '../../shared/components/Button';
import { CenteredState } from '../../shared/components/CenteredState';
import { ChipGroup } from '../../shared/components/ChipGroup';
import { ConfirmSheet } from '../../shared/components/ConfirmSheet';
import { FormField } from '../../shared/components/FormField';
import { Screen } from '../../shared/components/Screen';
import { SectionCard } from '../../shared/components/SectionCard';
import { SwitchRow } from '../../shared/components/SwitchRow';
import { colors } from '../../shared/theme/colors';
import { radii } from '../../shared/theme/radii';
import { spacing } from '../../shared/theme/spacing';
import { typography } from '../../shared/theme/typography';
import { hasPermission } from '../../shared/utils/permissions';
import type { MailTemplateRequest } from '../../types/api';
import { useDeleteTemplate, usePreviewTemplate, useSaveTemplate, useTemplate } from '../hooks/useTemplates';

// The values GET /admin/mail-templates/help lists; the backend stores any string.
const USAGE_TYPES = ['CUSTOMER_REPLY', 'ACKNOWLEDGEMENT', 'FOLLOW_UP', 'RESOLUTION', 'NEED_MORE_INFO', 'INTERNAL_UPDATE'];

const STATUS_AFTER_SEND = [
  { value: '', label: 'No change' },
  { value: 'WAITING_CUSTOMER', label: 'Waiting Customer' },
  { value: 'RESOLVED', label: 'Resolved' },
];

const PREVIEW_SAMPLE = {
  replyBody: 'Thanks for reaching out. We are looking into this and will get back to you shortly.',
  ticketRef: 'TCK-000123',
  mailboxName: 'Support',
  agentName: 'Jane Doe',
  signatureBlock: 'Jane Doe\nSupport Team',
};

export function TemplateFormScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const templateId: number | null = route.params?.templateId ?? null;
  const isEdit = templateId != null;

  const permissions = useSessionStore((state) => state.user?.permissionCodes ?? []);
  const canManage = hasPermission(permissions, 'EMAIL_CONFIG_MANAGE');

  const templateQuery = useTemplate(templateId);
  const saveTemplate = useSaveTemplate(templateId);
  const deleteTemplate = useDeleteTemplate();
  const preview = usePreviewTemplate(templateId);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [usageType, setUsageType] = useState('CUSTOMER_REPLY');
  const [description, setDescription] = useState('');
  const [subjectTemplate, setSubjectTemplate] = useState('');
  const [plainTextTemplate, setPlainTextTemplate] = useState('');
  const [htmlTemplate, setHtmlTemplate] = useState('');
  const [customerVisible, setCustomerVisible] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [defaultStatusAfterSend, setDefaultStatusAfterSend] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: !isEdit ? 'New Template' : canManage ? 'Edit Template' : 'Template' });
  }, [navigation, isEdit, canManage]);

  useEffect(() => {
    const template = templateQuery.data;
    if (!template) return;
    setCode(template.code);
    setName(template.name);
    setUsageType(template.usageType ?? '');
    setDescription(template.description ?? '');
    setSubjectTemplate(template.subjectTemplate ?? '');
    setPlainTextTemplate(template.plainTextTemplate ?? '');
    setHtmlTemplate(template.htmlTemplate ?? '');
    setCustomerVisible(template.customerVisible !== false);
    setIsActive(template.isActive !== false);
    setDefaultStatusAfterSend(template.defaultStatusAfterSend ?? '');
  }, [templateQuery.data]);

  if (isEdit && templateQuery.isLoading) {
    return <CenteredState title="Loading template" />;
  }
  if (isEdit && (templateQuery.isError || !templateQuery.data)) {
    return <CenteredState title="Could not load template" actionLabel="Retry" onAction={() => templateQuery.refetch()} />;
  }

  const template = templateQuery.data;
  const isBuiltIn = template?.isBuiltIn === true;
  const readOnly = !canManage;

  const errors = {
    code: code.trim() ? null : 'Code is required.',
    name: name.trim() ? null : 'Name is required.',
    plainTextTemplate: plainTextTemplate.trim() ? null : 'Plain text body is required.',
    htmlTemplate: htmlTemplate.trim() ? null : 'HTML body is required.',
  };
  const isValid = Object.values(errors).every((error) => error == null);

  const handleSave = () => {
    setShowErrors(true);
    if (!isValid) return;
    const request: MailTemplateRequest = {
      code: code.trim(),
      name: name.trim(),
      usageType: usageType.trim() || null,
      description: description.trim() || null,
      subjectTemplate: subjectTemplate.trim() || null,
      plainTextTemplate,
      htmlTemplate,
      customerVisible,
      isActive,
      defaultStatusAfterSend: defaultStatusAfterSend || null,
    };
    setSubmitError(null);
    saveTemplate.mutate(request, {
      onSuccess: (saved) => {
        if (isEdit) {
          navigation.goBack();
        } else {
          // Stay on the saved template so it can be previewed straight away.
          navigation.setParams({ templateId: saved.id });
        }
      },
      onError: (error) => setSubmitError(getDisplayMessage(error)),
    });
  };

  const usageOptions = Array.from(new Set([...USAGE_TYPES, ...(usageType ? [usageType] : [])])).map((value) => ({
    value,
    label: value.replace(/_/g, ' '),
  }));

  return (
    <Screen scrollable>
      {template ? (
        <View style={styles.badges}>
          {isBuiltIn ? <Badge label="Built-in" variant="outline" /> : null}
          <Badge label={template.isActive === false ? 'Inactive' : 'Active'} variant={template.isActive === false ? 'default' : 'success'} />
        </View>
      ) : null}

      <SectionCard title="Details">
        <View style={styles.form}>
          <FormField
            label="Code"
            value={code}
            onChangeText={(value) => setCode(value.toUpperCase())}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!isEdit && !readOnly}
            hint={isEdit ? 'The code cannot change after creation.' : 'Upper-case identifier, e.g. FOLLOW_UP_24H.'}
            error={showErrors ? errors.code : null}
          />
          <FormField label="Name" value={name} onChangeText={setName} editable={!readOnly} error={showErrors ? errors.name : null} />
          <FormField label="Description" value={description} onChangeText={setDescription} editable={!readOnly} placeholder="When to use this template" />
          <ChipGroup
            label="Usage"
            options={usageOptions}
            selected={usageType ? [usageType] : []}
            onToggle={(value) => setUsageType(value === usageType ? '' : value)}
            disabled={readOnly}
          />
          <ChipGroup
            label="Ticket status after sending"
            options={STATUS_AFTER_SEND}
            selected={[defaultStatusAfterSend]}
            onToggle={setDefaultStatusAfterSend}
            disabled={readOnly}
          />
          <SwitchRow
            label="Customer visible"
            description="Off for internal-only updates."
            value={customerVisible}
            onValueChange={setCustomerVisible}
            disabled={readOnly}
          />
          <SwitchRow
            label="Active"
            description={isBuiltIn ? 'Built-in templates cannot be deleted; switch them off instead.' : undefined}
            value={isActive}
            onValueChange={setIsActive}
            disabled={readOnly}
          />
        </View>
      </SectionCard>

      <SectionCard title="Content" subtitle="Placeholders like {replyBody}, {ticketRef}, {agentName} and {signatureBlock} are filled in when the email is sent.">
        <View style={styles.form}>
          <FormField label="Subject" value={subjectTemplate} onChangeText={setSubjectTemplate} editable={!readOnly} placeholder="Re: {ticketRef}" />
          <FormField
            label="Plain text body"
            value={plainTextTemplate}
            onChangeText={setPlainTextTemplate}
            editable={!readOnly}
            multiline
            error={showErrors ? errors.plainTextTemplate : null}
          />
          <FormField
            label="HTML body"
            value={htmlTemplate}
            onChangeText={setHtmlTemplate}
            editable={!readOnly}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
            hint="Scripts, iframes and javascript: links are rejected."
            error={showErrors ? errors.htmlTemplate : null}
          />
        </View>
      </SectionCard>

      {isEdit && canManage ? (
        <SectionCard title="Preview" subtitle="Renders the saved version with sample values." icon={Eye}>
          <Button
            label={preview.data ? 'Refresh preview' : 'Show preview'}
            variant="secondary"
            size="sm"
            onPress={() => preview.mutate(PREVIEW_SAMPLE)}
            loading={preview.isPending}
          />
          {preview.isError ? <Text style={styles.error}>{getDisplayMessage(preview.error)}</Text> : null}
          {preview.data ? (
            <View style={styles.preview}>
              <Text style={styles.previewLabel}>Subject</Text>
              <Text style={styles.previewSubject}>{preview.data.subject || '—'}</Text>
              <Text style={[styles.previewLabel, styles.spaced]}>Body</Text>
              <Text style={styles.previewBody}>{preview.data.text || 'Plain text preview is empty.'}</Text>
            </View>
          ) : null}
        </SectionCard>
      ) : null}

      {submitError ? <Text style={styles.error}>{submitError}</Text> : null}

      {canManage ? (
        <Button label={isEdit ? 'Save changes' : 'Create template'} onPress={handleSave} loading={saveTemplate.isPending} />
      ) : (
        <Text style={styles.readOnlyNote}>You can view templates but not change them.</Text>
      )}

      {isEdit && canManage && !isBuiltIn ? (
        <Button
          label="Delete template"
          variant="ghost"
          icon={<Trash2 size={16} color={colors.primary} />}
          onPress={() => setConfirmDeleteOpen(true)}
        />
      ) : null}

      <ConfirmSheet
        visible={confirmDeleteOpen}
        title="Delete template?"
        message={`"${name}" will no longer be available in the reply composer. This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        isSubmitting={deleteTemplate.isPending}
        errorMessage={deleteTemplate.error ? getDisplayMessage(deleteTemplate.error) : null}
        onConfirm={() => templateId != null && deleteTemplate.mutate(templateId, { onSuccess: () => navigation.goBack() })}
        onClose={() => {
          setConfirmDeleteOpen(false);
          deleteTemplate.reset();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  badges: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  form: {
    gap: spacing.md,
  },
  error: {
    ...typography.caption,
    color: colors.errorText,
    marginTop: spacing.sm,
  },
  preview: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    backgroundColor: colors.surfaceMuted,
  },
  previewLabel: {
    ...typography.label,
  },
  previewSubject: {
    ...typography.bodyStrong,
    marginTop: 2,
  },
  previewBody: {
    ...typography.body,
    marginTop: 2,
  },
  spaced: {
    marginTop: spacing.md,
  },
  readOnlyNote: {
    ...typography.caption,
    textAlign: 'center',
  },
});
