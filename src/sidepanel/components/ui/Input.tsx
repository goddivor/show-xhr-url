import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', icon, ...props }, ref) => {
    if (icon) {
      return (
        <div className="input-wrapper">
          <span className="input-icon">{icon}</span>
          <input
            ref={ref}
            className={`devtools-input input-with-icon ${className}`}
            {...props}
          />
        </div>
      );
    }

    return (
      <input
        ref={ref}
        className={`devtools-input ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
