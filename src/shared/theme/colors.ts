export const colors = {
  background: '#F5F7FB',
  surface: '#FFFFFF',
  surfaceMuted: '#F8FAFC',
  surfaceRaised: '#FFFFFF',

  text: '#0F172A',
  textInverse: '#FFFFFF',
  muted: '#475569',
  mutedLight: '#94A3B8',

  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  divider: '#EEF2F7',

  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryMuted: '#EFF6FF',
  onPrimary: '#FFFFFF',

  danger: '#DC2626',
  dangerDark: '#B91C1C',
  dangerMuted: '#FEF2F2',
  onDanger: '#FFFFFF',

  // Semantic status palette — mirrors caseflow-fe's shared Badge variants
  // (src/components/shared/Badge.tsx) so both clients read as one system.
  successMuted: '#ECFDF5',
  successBorder: '#A7F3D0',
  successText: '#065F46',

  warningMuted: '#FFFBEB',
  warningBorder: '#FDE68A',
  warningText: '#92400E',

  infoMuted: '#EFF6FF',
  infoBorder: '#BFDBFE',
  infoText: '#1E40AF',

  errorMuted: '#FFF1F2',
  errorBorder: '#FECDD3',
  errorText: '#9F1239',

  // Ticket priority uses a distinct orange step between warning and error,
  // matching caseflow-fe's PriorityBadge (src/components/tickets/PriorityBadge.tsx).
  orangeMuted: '#FFF7ED',
  orangeBorder: '#FED7AA',
  orangeText: '#9A3412',

  neutralMuted: '#F1F5F9',

  overlay: 'rgba(15, 23, 42, 0.45)',
  shadowColor: '#0F172A',
};
