import { useNavigation } from '@react-navigation/native';
import { ChevronRight, FileText, Plus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSessionStore } from '../../core/auth/sessionStore';
import { Badge } from '../../shared/components/Badge';
import { Button } from '../../shared/components/Button';
import { CenteredState } from '../../shared/components/CenteredState';
import { EmptyState } from '../../shared/components/EmptyState';
import { FormField } from '../../shared/components/FormField';
import { ListSkeleton } from '../../shared/components/ListSkeleton';
import { Screen } from '../../shared/components/Screen';
import { SwitchRow } from '../../shared/components/SwitchRow';
import { colors } from '../../shared/theme/colors';
import { radii } from '../../shared/theme/radii';
import { shadows } from '../../shared/theme/shadows';
import { spacing } from '../../shared/theme/spacing';
import { typography } from '../../shared/theme/typography';
import { hasPermission } from '../../shared/utils/permissions';
import { useTemplates } from '../hooks/useTemplates';

export function TemplatesScreen() {
  const navigation = useNavigation<any>();
  const permissions = useSessionStore((state) => state.user?.permissionCodes ?? []);
  const canManage = hasPermission(permissions, 'EMAIL_CONFIG_MANAGE');

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const templatesQuery = useTemplates({ search, activeOnly });
  const templates = templatesQuery.data ?? [];

  if (templatesQuery.isError && !templatesQuery.data) {
    return <CenteredState title="Could not load mail templates" actionLabel="Retry" onAction={() => templatesQuery.refetch()} />;
  }

  return (
    <Screen
      scrollable
      refreshControl={<RefreshControl refreshing={templatesQuery.isRefetching} onRefresh={() => templatesQuery.refetch()} />}
    >
      <FormField label="Search" value={searchInput} onChangeText={setSearchInput} placeholder="Name or code" autoCorrect={false} />
      <SwitchRow label="Active only" value={activeOnly} onValueChange={setActiveOnly} />

      {canManage ? (
        <Button
          label="New template"
          icon={<Plus size={16} color={colors.onPrimary} />}
          onPress={() => navigation.navigate('TemplateForm', {})}
        />
      ) : null}

      {templatesQuery.isLoading ? (
        <ListSkeleton rows={4} />
      ) : templates.length === 0 ? (
        <EmptyState icon={FileText} title="No templates found" description={search || activeOnly ? 'Try a different search or filter.' : undefined} />
      ) : (
        templates.map((template) => (
          <Pressable
            key={template.id}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => navigation.navigate('TemplateForm', { templateId: template.id })}
          >
            <View style={styles.cardText}>
              <Text style={styles.name} numberOfLines={1}>{template.name}</Text>
              <Text style={styles.meta} numberOfLines={1}>
                {template.code} · {template.usageType ?? 'GENERAL'}
              </Text>
              <View style={styles.badges}>
                <Badge label={template.isActive === false ? 'Inactive' : 'Active'} variant={template.isActive === false ? 'default' : 'success'} />
                {template.isBuiltIn ? <Badge label="Built-in" variant="outline" /> : null}
                {template.customerVisible === false ? <Badge label="Internal" variant="warning" /> : null}
              </View>
            </View>
            <ChevronRight size={18} color={colors.mutedLight} />
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.soft,
  },
  cardPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  name: {
    ...typography.bodyStrong,
  },
  meta: {
    ...typography.caption,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: 2,
  },
});
