import { Badge } from './Badge';
import { getStatusConfig } from '../theme/status';

interface Props {
  status?: string | null;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: Props) {
  const config = getStatusConfig(status);
  return <Badge label={config.label} variant={config.variant} size={size} />;
}
