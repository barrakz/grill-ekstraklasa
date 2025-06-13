'use client';

import { ButtonHTMLAttributes } from 'react';

interface FormButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export default function FormButton({
  children,
  variant = 'primary',
  fullWidth = false,
  isLoading = false,
  className = "",
  ...rest
}: FormButtonProps) {
  const variantClasses = {
    primary: 'bg-teal-500 hover:bg-teal-600 text-white',
    secondary: 'bg-blue-500 hover:bg-blue-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white'
  };
  
  const baseClass = 'px-4 py-3 rounded-lg font-medium transition-colors';
  const widthClass = fullWidth ? 'w-full' : '';
  const loadingClass = isLoading ? 'opacity-70 cursor-not-allowed' : '';
  
  const buttonClass = `${baseClass} ${variantClasses[variant]} ${widthClass} ${loadingClass} ${className}`;
  
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
