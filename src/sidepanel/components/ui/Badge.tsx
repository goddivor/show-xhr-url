import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'method' | undefined;
  method?: string | undefined;
  className?: string | undefined;
}

const methodColors: Record<string, string> = {
  GET: 'badge-get',
  POST: 'badge-post',
  PUT: 'badge-put',
  PATCH: 'badge-patch',
  DELETE: 'badge-delete',
  OPTIONS: 'badge-options',
  HEAD: 'badge-head',
};

const BADGE_FALLBACK = 'badge-default';

const statusColors: Record<string, string> = {
  default: BADGE_FALLBACK,
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  info: 'badge-info',
};

export function Badge({ children, variant = 'default', method, className = '' }: BadgeProps) {
  let colorClass = statusColors[variant] ?? BADGE_FALLBACK;

  if (variant === 'method' && method) {
    colorClass = methodColors[method.toUpperCase()] ?? BADGE_FALLBACK;
  }

  return <span className={`badge ${colorClass} ${className}`}>{children}</span>;
}

export function MethodBadge({ method }: { method: string }) {
  return (
    <Badge variant="method" method={method}>
      {method.toUpperCase()}
    </Badge>
  );
}

export function StatusBadge({ status }: { status?: number | undefined }) {
  if (!status) {
    return <Badge variant="default">Pending</Badge>;
  }

  let variant: BadgeProps['variant'] = 'default';
  if (status >= 200 && status < 300) variant = 'success';
  else if (status >= 300 && status < 400) variant = 'info';
  else if (status >= 400 && status < 500) variant = 'warning';
  else if (status >= 500) variant = 'error';

  return <Badge variant={variant}>{status}</Badge>;
}
