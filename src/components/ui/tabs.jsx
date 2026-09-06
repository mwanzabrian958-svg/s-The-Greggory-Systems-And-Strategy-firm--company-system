import React, { createContext, useContext, useState } from 'react';

const TabsContext = createContext(null);

export function Tabs({ defaultValue, value: controlled, onValueChange, className = '', children, ...props }) {
  const [internal, setInternal] = useState(defaultValue);
  const value = controlled !== undefined ? controlled : internal;

  const setValue = (v) => {
    setInternal(v);
    if (onValueChange) onValueChange(v);
  };

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className = '', children, ...props }) {
  return (
    <div
      className={`inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, className = '', children, ...props }) {
  const ctx = useContext(TabsContext);
  const isActive = ctx?.value === value;
  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus:outline-none ${
        isActive ? 'bg-white text-[#002D62] shadow-sm' : 'text-gray-500 hover:text-gray-700'
      } ${className}`}
      onClick={() => ctx?.setValue(value)}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className = '', children, ...props }) {
  const ctx = useContext(TabsContext);
  if (ctx?.value !== value) return null;
  return (
    <div className={`mt-4 focus:outline-none ${className}`} {...props}>
      {children}
    </div>
  );
}