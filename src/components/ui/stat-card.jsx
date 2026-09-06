import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';

export function StatCard({ title, value, change, icon, className = '' }) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {change && (
          <div className="flex items-center gap-1 pt-1 text-xs text-gray-500">
            {icon}
            <span>{change}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default StatCard;