import React from 'react';

export function Progress({ value = 0, className = '', ...props }) {
  const pct = Math.min(100, Math.max(0, value || 0));
  return (
    <div
      className={`relative w-full overflow-hidden rounded-full bg-gray-200 ${className}`}
      {...props}
    >
      <div
        className="h-full rounded-full bg-[#3B82F6] transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}