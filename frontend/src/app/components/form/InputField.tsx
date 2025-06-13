'use client';

import { InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function InputField({ 
  label, 
  error, 
  id, 
  className = "", 
  ...rest 
}: InputFieldProps) {
  const baseInputClass = "w-full rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40";
  const inputClass = `${baseInputClass} ${error ? 'border-red-500' : ''} ${className}`;
  
  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium mb-1 text-white">
          {label}
        </label>
      )}
      <input
        id={id}
        className={inputClass}
        {...rest}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
