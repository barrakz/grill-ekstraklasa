'use client';

import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'accent' | 'teal' | 'success' | 'filter';
  size?: 'default' | 'small' | 'tiny';
  fullWidth?: boolean;
  isLoading?: boolean;
  active?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'small',  // Zmienione z 'default' na 'small'
  fullWidth = false,
  isLoading = false,
  active = false,
  className = "",
  ...rest
}: ButtonProps) {  const variantClasses = {
    primary: 'bg-accent-color hover:bg-accent-hover text-white shadow-md',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white/80',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    accent: 'bg-accent-color hover:bg-accent-hover text-white',
    teal: 'bg-teal-500 hover:bg-teal-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white',
    filter: active ? 'bg-blue-600 text-white' : 'bg-blue-400 text-white/80 hover:bg-blue-500'
  };
  const sizeClass = size === 'small' ? 'btn-sm' : size === 'tiny' ? 'btn-tiny' : '';
  const widthClass = fullWidth ? 'w-full' : '';
  const loadingClass = isLoading ? 'opacity-70 cursor-not-allowed' : '';
  const activeClass = active ? 'font-bold border-b-2 border-white relative' : '';
  
  const buttonClass = `${sizeClass} ${variantClasses[variant]} ${widthClass} ${loadingClass} ${activeClass} ${className}`;
  
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
