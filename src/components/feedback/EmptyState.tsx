import React from 'react';
import { cn } from '@/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { LucideIcon } from 'lucide-react';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon | React.ReactNode;
  title: string;
  description: string;
  badgeText?: string;
  actionText?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  badgeText,
  actionText,
  onAction,
  actionIcon,
  action,
  className,
  children,
  ...props
}) => {
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComp = icon as React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
    return <IconComp className="w-6 h-6 stroke-[1.5]" aria-hidden={true} />;
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-surface-border-strong bg-white/70 max-w-2xl mx-auto my-6',
        className
      )}
      {...props}
    >
      {badgeText && (
        <Badge variant="neutral" size="sm" className="mb-4">
          {badgeText}
        </Badge>
      )}

      {icon && (
        <div className="w-12 h-12 rounded-lg bg-surface-muted border border-surface-border flex items-center justify-center text-surface-foreground-muted mb-4 shadow-subtle">
          {renderIcon()}
        </div>
      )}

      <h3 className="text-base font-semibold text-surface-foreground tracking-tight mb-2">
        {title}
      </h3>

      <p className="text-xs md:text-sm text-surface-foreground-muted max-w-md leading-relaxed mb-6">
        {description}
      </p>

      {actionText && onAction && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onAction}
          rightIcon={actionIcon}
        >
          {actionText}
        </Button>
      )}

      {action && <div className="mt-2">{action}</div>}

      {children}
    </div>
  );
};
