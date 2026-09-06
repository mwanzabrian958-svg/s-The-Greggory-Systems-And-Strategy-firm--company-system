import React from 'react';

const variants = {
  default: 'bg-[#3B82F6] text-white hover:bg-[#2563EB]',
  navy: 'bg-[#002D62] text-white hover:bg-[#001A3D]',
  outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-gray-700 hover:bg-gray-100'
};

const sizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-8 px-3 text-xs',
  lg: 'h-11 px-8',
  icon: 'h-10 w-10'
};

export function Button({ className = '', variant = 'default', size = 'default', children, disabled, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/40 disabled:pointer-events-none disabled:opacity-50 ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}