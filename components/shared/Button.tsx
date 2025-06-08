import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  className,
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 transition-all duration-150 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-500 dark:bg-teal-500 dark:hover:bg-teal-600 dark:focus:ring-teal-400',
    secondary: 'bg-yellow-400 hover:bg-yellow-500 text-neutral-800 focus:ring-yellow-400 dark:bg-yellow-500 dark:hover:bg-yellow-600 dark:text-neutral-900 dark:focus:ring-yellow-300',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-500',
    ghost: 'bg-transparent hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 focus:ring-neutral-400 dark:focus:ring-neutral-500 border border-neutral-300 dark:border-neutral-600',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};
