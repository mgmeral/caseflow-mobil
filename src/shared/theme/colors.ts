// Values come from caseflow-fe's design tokens (src/index.css :root and its
// neutral remap) so both clients read as one product.
export const colors = {
  background: '#EDF3F8', // --surface-base
  surface: '#FFFFFF',
  surfaceMuted: '#F7FAFF', // rgba(247,250,255) section fill
  surfaceRaised: '#FFFFFF',

  text: '#0B1324', // --text-strong
  textBody: '#243247', // --text-body
  textInverse: '#FFFFFF',
  muted: '#5D6C81', // --text-muted
  mutedLight: '#94A3B8',

  border: 'rgba(122, 142, 170, 0.16)', // --surface-border
  borderStrong: 'rgba(99, 120, 149, 0.28)', // --surface-border-strong
  divider: '#EEF2F7',

  primary: '#1F6FFF', // --accent
  primaryDark: '#1258E3', // --accent-strong
  primaryMuted: 'rgba(31, 111, 255, 0.10)',
  primaryTint: 'rgba(31, 111, 255, 0.14)', // --accent-soft
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

  overlay: 'rgba(11, 19, 36, 0.45)',
  shadowColor: '#0B1324',
};

// Gradient stops for surfaces caseflow-fe paints with linear-gradient().
export const gradients = {
  // html background: #f8fbff → #f1f6fb → #eaf0f6 (the radial accents are approximated by the first stop)
  page: ['#F4F8FF', '#F1F6FB', '#EAF0F6'] as const,
  // .surface-card
  card: ['rgba(255,255,255,0.98)', 'rgba(247,250,255,0.95)'] as const,
  // .premium-stat-card: top-left accent glow over the card gradient
  statCard: ['rgba(31,111,255,0.10)', 'rgba(255,255,255,0.98)', 'rgba(244,248,255,0.95)'] as const,
  // Button variants
  primary: ['#2F7BFF', '#1258E3'] as const,
  secondary: ['rgba(255,255,255,0.8)', 'rgba(236,244,255,0.72)'] as const,
  danger: ['#EF4444', '#DC2626'] as const,
};
