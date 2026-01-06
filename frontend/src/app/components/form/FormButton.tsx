'use client';

import { ButtonHTMLAttributes } from 'react';

interface FormButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'default' | 'small';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export default function FormButton({
  children,
  variant = 'primary',
  size = 'default',
  fullWidth = false,
  isLoading = false,
  className = "",
  ...rest
}: FormButtonProps) {
  const variantClasses = {
    primary: 'bg-accent-color hover:bg-accent-hover text-white',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
    danger: 'bg-rose-500 hover:bg-rose-600 text-white'
  };
  
  // Użyj klasy btn-sm dla małych przycisków
  const sizeClass = size === 'small' ? 'btn-sm' : '';
  const widthClass = fullWidth ? 'w-full' : '';
  const loadingClass = isLoading ? 'opacity-70 cursor-not-allowed' : '';
  
  const buttonClass = `${sizeClass} ${variantClasses[variant]} ${widthClass} ${loadingClass} ${className}`;
  
  return (
    <button 
      className={buttonClass} 
      disabled={isLoading || rest.disabled}
      {...rest}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Ładowanie...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}
