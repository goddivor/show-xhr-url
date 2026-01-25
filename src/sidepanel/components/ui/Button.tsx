import { forwardRef, type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'ghost';
  size?: 'sm' | 'md';
  active?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'md', active = false, children, ...props }, ref) => {
    const baseStyles = 'devtools-button';

    const variants: Record<string, string> = {
      default: '',
      primary: 'devtools-button-primary',
      ghost: 'border-transparent bg-transparent',
    };

    const sizes: Record<string, string> = {
      sm: 'h-6 px-2',
      md: '',
    };

    const activeStyles = active ? 'devtools-button-active' : '';

    const classes = [baseStyles, variants[variant], sizes[size], activeStyles, className]
      .filter(Boolean)
      .join(' ');

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
