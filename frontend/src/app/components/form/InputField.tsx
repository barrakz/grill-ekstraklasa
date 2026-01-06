'use client';

import { InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export default function InputField({ 
  label, 
  error, 
  id, 
  className = "", 
  containerClassName = "mb-3",
  ...rest 
}: InputFieldProps) {
  const baseInputClass = "w-full rounded-lg bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent-color focus:ring-2 focus:ring-accent-color/20 shadow-sm";
  const inputClass = `${baseInputClass} ${error ? 'border-red-500' : ''} ${className}`;
  
  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium mb-1 text-slate-700">
          {label}
        </label>
      )}
      <input
        id={id}
        className={inputClass}
        {...rest}
      />
      {error && <p className="text-rose-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
