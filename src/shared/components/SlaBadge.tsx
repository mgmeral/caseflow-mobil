import { Badge } from './Badge';
import { getSlaConfig } from '../theme/status';

interface Props {
  slaState?: string | null;
  size?: 'sm' | 'md';
}

/** Renders nothing when there's no SLA state to show, rather than a "N/A" pill. */
export function SlaBadge({ slaState, size = 'sm' }: Props) {
  const config = getSlaConfig(slaState);
  if (!config) {
    return null;
  }
  return <Badge label={config.label} variant={config.variant} size={size} />;
}
