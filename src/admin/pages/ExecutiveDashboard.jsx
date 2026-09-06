import React from 'react';
import DepartmentNavBar from '../components/DepartmentNavBar';
import { DEPARTMENT_NAV_BARS } from '../config/department-navbars';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Globe, Calendar, BarChart3, Users } from 'lucide-react';

export default function ExecutiveDashboard() {
  const metrics = [
    { title: "Revenue", value: "$2.4M", change: "+12% MoM", icon: <BarChart3 className="h-4 w-4" /> },
    { title: "Client Growth", value: "127", change: "+8% YoY", icon: <Globe className="h-4 w-4" /> },
    { title: "Project Delivery", value: "94%", change: "+2%", icon: <Calendar className="h-4 w-4" /> },
    { title: "Market Expansion", value: "3", change: "+1 region", icon: <Users className="h-4 w-4" /> }
  ];

  const chartData = [
    { month: 'Jan', revenue: 180, projects: 12 },
    { month: 'Feb', revenue: 200, projects: 15 },
    { month: 'Mar', revenue: 220, projects: 18 },
    { month: 'Apr', revenue: 240, projects: 22 },
    { month: 'May', revenue: 260, projects: 25 },
    { month: 'Jun', revenue: 240, projects: 28 }
  ];

  return (
    <div className="p-6 space-y-6">
      <DepartmentNavBar links={DEPARTMENT_NAV_BARS.executive} />

      {/* Department Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Executive Office</h1>
        <p className="text-muted-foreground">Strategic oversight, financial KPIs, and global impact metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <StatCard 
            key={metric.title}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            icon={metric.icon}
          />
        ))}
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Global Revenue & Project Delivery</CardTitle>
          <CardDescription>6-month performance overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="projects" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Strategic Initiatives */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Strategic Initiatives</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Market expansion into EMEA region</span>
              <Badge variant="outline">In Progress</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>New product line launch</span>
              <Badge variant="outline">Planning</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Strategic partnership evaluation</span>
              <Badge variant="outline">Completed</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Supporting component
export function StatCard({ title, value, change, icon }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center pt-1 text-xs text-muted-foreground">
          {icon} {change}
        </div>
      </CardContent>
    </Card>
  );
}