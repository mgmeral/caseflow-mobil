import { useNavigation, useRoute } from '@react-navigation/native';
import { Trash2 } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getDisplayMessage } from '../../core/api/http';
import { useCustomers } from '../../customers/hooks/useCustomers';
import { useGroups } from '../../groups/hooks/useGroups';
import { ChipGroup } from '../../shared/components/ChipGroup';
import { Button } from '../../shared/components/Button';
import { CenteredState } from '../../shared/components/CenteredState';
import { ConfirmSheet } from '../../shared/components/ConfirmSheet';
import { FormField } from '../../shared/components/FormField';
import { Screen } from '../../shared/components/Screen';
import { SectionCard } from '../../shared/components/SectionCard';
import { SelectSheet } from '../../shared/components/SelectSheet';
import { SwitchRow } from '../../shared/components/SwitchRow';
import { colors } from '../../shared/theme/colors';
import { radii } from '../../shared/theme/radii';
import { spacing } from '../../shared/theme/spacing';
import { typography } from '../../shared/theme/typography';
import type { ChannelConfigRequest, ChannelScopeType, ChannelType } from '../../types/api';
import { useChannel, useDeleteChannel, useEventCatalog, useSaveChannel } from '../hooks/useChannels';
import { formatEventName, parseSubscribedEvents } from '../utils/channels';

const CHANNEL_TYPES: { value: ChannelType; label: string }[] = [
  { value: 'SLACK', label: 'Slack' },
  { value: 'TEAMS', label: 'Microsoft Teams' },
];

const SCOPE_TYPES: { value: ChannelScopeType; label: string }[] = [
  { value: 'GLOBAL', label: 'All tickets' },
  { value: 'GROUP', label: 'One group' },
  { value: 'CUSTOMER', label: 'One customer' },
];

export function ChannelFormScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const channelId: number | null = route.params?.channelId ?? null;
  const isEdit = channelId != null;

  const channelQuery = useChannel(channelId);
  const catalogQuery = useEventCatalog();
  const saveChannel = useSaveChannel(channelId);
  const deleteChannel = useDeleteChannel();

  const [name, setName] = useState('');
  const [channelType, setChannelType] = useState<ChannelType>('SLACK');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [events, setEvents] = useState<string[]>([]);
  const [scopeType, setScopeType] = useState<ChannelScopeType>('GLOBAL');
  const [scopeId, setScopeId] = useState<number | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [scopePickerOpen, setScopePickerOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  const groupsQuery = useGroups(scopeType === 'GROUP');
  const customersQuery = useCustomers();

  useEffect(() => {
    navigation.setOptions({ title: isEdit ? 'Edit Channel' : 'New Channel' });
  }, [navigation, isEdit]);

  useEffect(() => {
    const channel = channelQuery.data;
    if (!channel) return;
    setName(channel.name);
    setChannelType(channel.channelType);
    setEvents(parseSubscribedEvents(channel.subscribedEvents));
    setScopeType(channel.scopeType ?? 'GLOBAL');
    setScopeId(channel.scopeId);
    setEnabled(channel.enabled);
  }, [channelQuery.data]);

  const scopeOptions = useMemo(() => {
    if (scopeType === 'GROUP') {
      return (groupsQuery.data ?? []).map((group) => ({ value: String(group.id), label: group.name }));
    }
    if (scopeType === 'CUSTOMER') {
      return (customersQuery.data?.pages ?? []).flatMap((page) => page.items).map((customer) => ({
        value: String(customer.id),
        label: customer.name,
      }));
    }
    return [];
  }, [scopeType, groupsQuery.data, customersQuery.data]);

  if (isEdit && channelQuery.isLoading) {
    return <CenteredState title="Loading channel" />;
  }
  if (isEdit && (channelQuery.isError || !channelQuery.data)) {
    return <CenteredState title="Could not load channel" actionLabel="Retry" onAction={() => channelQuery.refetch()} />;
  }

  const selectedScopeLabel = scopeOptions.find((option) => option.value === String(scopeId))?.label
    ?? (scopeId != null ? `#${scopeId}` : null);

  const errors = {
    name: name.trim() ? null : 'Name is required.',
    webhookUrl: !isEdit && !webhookUrl.trim() ? 'Webhook URL is required.' : null,
    events: events.length > 0 ? null : 'Pick at least one event.',
    scope: scopeType !== 'GLOBAL' && scopeId == null ? `Choose the ${scopeType === 'GROUP' ? 'group' : 'customer'}.` : null,
  };
  const isValid = Object.values(errors).every((error) => error == null);

  const handleSave = () => {
    setShowErrors(true);
    if (!isValid) return;
    const request: ChannelConfigRequest = {
      name: name.trim(),
      channelType,
      // Blank on update keeps the stored URL, which the backend never returns.
      webhookUrl: webhookUrl.trim() || undefined,
      subscribedEvents: events,
      scopeType,
      scopeId: scopeType === 'GLOBAL' ? null : scopeId,
      enabled,
    };
    setSubmitError(null);
    saveChannel.mutate(request, {
      onSuccess: () => navigation.goBack(),
      onError: (error) => setSubmitError(getDisplayMessage(error)),
    });
  };

  const toggleEvent = (event: string) => {
    setEvents((current) => (current.includes(event) ? current.filter((item) => item !== event) : [...current, event]));
  };

  const catalog = catalogQuery.data ?? [];

  return (
    <Screen scrollable>
      <SectionCard title="Channel">
        <View style={styles.form}>
          <FormField label="Name" value={name} onChangeText={setName} placeholder="Support alerts" error={showErrors ? errors.name : null} />
          <ChipGroup label="Type" options={CHANNEL_TYPES} selected={[channelType]} onToggle={setChannelType} />
          <FormField
            label="Webhook URL"
            value={webhookUrl}
            onChangeText={setWebhookUrl}
            placeholder={isEdit ? 'Leave blank to keep the saved URL' : 'https://hooks.slack.com/…'}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            hint={isEdit ? 'The saved URL is never shown. Enter a new one only to replace it.' : undefined}
            error={showErrors ? errors.webhookUrl : null}
          />
          <SwitchRow label="Enabled" description="Disabled channels keep their settings but post nothing." value={enabled} onValueChange={setEnabled} />
        </View>
      </SectionCard>

      <SectionCard title="Which tickets" subtitle="Limit the channel to one group's or one customer's tickets.">
        <View style={styles.form}>
          <ChipGroup
            options={SCOPE_TYPES}
            selected={[scopeType]}
            onToggle={(value) => {
              setScopeType(value);
              setScopeId(null);
            }}
          />
          {scopeType !== 'GLOBAL' ? (
            <Pressable style={styles.picker} onPress={() => setScopePickerOpen(true)}>
              <Text style={selectedScopeLabel ? styles.pickerValue : styles.pickerPlaceholder}>
                {selectedScopeLabel ?? `Choose a ${scopeType === 'GROUP' ? 'group' : 'customer'}`}
              </Text>
            </Pressable>
          ) : null}
          {showErrors && errors.scope ? <Text style={styles.error}>{errors.scope}</Text> : null}
        </View>
      </SectionCard>

      <SectionCard title="Events" subtitle="The channel posts a message when any selected event happens.">
        {catalogQuery.isLoading ? (
          <Text style={styles.muted}>Loading events…</Text>
        ) : catalogQuery.isError ? (
          <Text style={styles.error}>Could not load the event list.</Text>
        ) : (
          <ChipGroup
            options={catalog.map((event) => ({ value: event, label: formatEventName(event) }))}
            selected={events}
            onToggle={toggleEvent}
          />
        )}
        {showErrors && errors.events ? <Text style={[styles.error, styles.spaced]}>{errors.events}</Text> : null}
      </SectionCard>

      {submitError ? <Text style={styles.error}>{submitError}</Text> : null}

      <Button label={isEdit ? 'Save changes' : 'Create channel'} onPress={handleSave} loading={saveChannel.isPending} />

      {isEdit ? (
        <Button
          label="Delete channel"
          variant="ghost"
          icon={<Trash2 size={16} color={colors.primary} />}
          onPress={() => setConfirmDeleteOpen(true)}
        />
      ) : null}

      <SelectSheet
        visible={scopePickerOpen}
        title={scopeType === 'GROUP' ? 'Choose group' : 'Choose customer'}
        options={scopeOptions}
        selectedValue={scopeId != null ? String(scopeId) : null}
        emptyLabel="Nothing to choose from."
        onSelect={(value) => {
          setScopeId(Number(value));
          setScopePickerOpen(false);
        }}
        onClose={() => setScopePickerOpen(false)}
      />

      <ConfirmSheet
        visible={confirmDeleteOpen}
        title="Delete channel?"
        message={`"${name}" stops receiving ticket events. This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        isSubmitting={deleteChannel.isPending}
        errorMessage={deleteChannel.error ? getDisplayMessage(deleteChannel.error) : null}
        onConfirm={() => channelId != null && deleteChannel.mutate(channelId, { onSuccess: () => navigation.goBack() })}
        onClose={() => {
          setConfirmDeleteOpen(false);
          deleteChannel.reset();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  picker: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  pickerValue: {
    ...typography.bodyStrong,
  },
  pickerPlaceholder: {
    ...typography.body,
    color: colors.mutedLight,
  },
  muted: {
    ...typography.caption,
  },
  error: {
    ...typography.caption,
    color: colors.errorText,
  },
  spaced: {
    marginTop: spacing.sm,
  },
});
