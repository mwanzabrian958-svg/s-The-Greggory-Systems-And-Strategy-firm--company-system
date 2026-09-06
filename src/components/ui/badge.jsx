import React from 'react';

const variants = {
  default: 'bg-[#002D62] text-white',
  secondary: 'bg-gray-100 text-gray-700',
  outline: 'border border-gray-300 text-gray-700',
  destructive: 'bg-red-100 text-red-700',
  success: 'bg-green-100 text-green-700'
};

export function Badge({ className = '', variant = 'default', children, ...props }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${variants[variant] || variants.default} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}