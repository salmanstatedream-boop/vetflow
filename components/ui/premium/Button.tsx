'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  block?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: 'app-btn-primary app-focus-ring',
  secondary: 'app-btn-secondary app-focus-ring',
  ghost: 'app-btn-ghost app-focus-ring',
  danger: 'app-btn-danger app-focus-ring',
  soft: 'app-btn-soft app-focus-ring',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'app-btn-sm',
  md: '',
  lg: 'app-btn-lg',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading,
      disabled,
      icon,
      block,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        variantClass[variant],
        sizeClass[size],
        block && 'app-btn-block',
        className
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-3.5 animate-spin" /> : icon}
      {children}
    </button>
  )
);
Button.displayName = 'Button';

export default Button;
