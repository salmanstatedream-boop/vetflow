'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: 'app-btn-primary app-focus-ring disabled:opacity-50 disabled:cursor-not-allowed',
  secondary:
    'border border-outline-variant text-on-surface hover:bg-surface-container-high hover:border-primary/25 app-focus-ring',
  ghost: 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface app-focus-ring',
  danger: 'bg-destructive text-white hover:opacity-90 app-focus-ring',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', loading, disabled, icon, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed',
        variantClass[variant],
        className
      )}
      {...props}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icon}
      {children}
    </button>
  )
);
Button.displayName = 'Button';

export default Button;
