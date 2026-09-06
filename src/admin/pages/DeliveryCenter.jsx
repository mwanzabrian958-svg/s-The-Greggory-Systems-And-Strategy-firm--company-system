import React from 'react';
import DepartmentNavBar from '../components/DepartmentNavBar';
import { DEPARTMENT_NAV_BARS } from '../config/department-navbars';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function DeliveryCenter() {
  const implementations = [
    { id: 1, project: "ERP System Deployment", client: "TechGlobal Inc", status: "on-track", deadline: "2024-03-15" },
    { id: 2, project: "CRM Migration", client: "FinServe Ltd", status: "at-risk", deadline: "2024-02-28" },
    { id: 3, project: "Cloud Infrastructure", client: "RetailCorp", status: "completed", deadline: "2024-01-20" }
  ];

  const milestones = [
    { name: "Requirements Gathering", completed: true },
    { name: "System Architecture", completed: true },
    { name: "Development Phase", completed: true },
    { name: "Testing & QA", completed: false },
    { name: "Go-Live & Training", completed: false }
  ];

  return (
    <div className="p-6 space-y-6">
      <DepartmentNavBar links={DEPARTMENT_NAV_BARS.delivery} />

      {/* Department Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Delivery & Implementation</h1>
        <p className="text-muted-foreground">Project timelines, milestone tracking, and client rollout status</p>
      </div>

      {/* Timeline Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] border-l-2 border-blue-600 ml-4 pl-6 relative">
            {milestones.map((milestone, index) => (
              <div key={milestone.name} className="mb-6 relative">
                <div className="absolute -left-[18px] top-0 w-4 h-4 rounded-full bg-blue-600"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {milestone.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                    )}
                    <span className={milestone.completed ? "font-medium" : "text-muted-foreground"}>
                      {milestone.name}
                    </span>
                  </div>
                  <Badge variant={milestone.completed ? "default" : "secondary"}>
                    {milestone.completed ? "Done" : "Pending"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Client Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {implementations.map((impl) => (
          <Card key={impl.id}>
            <CardHeader>
              <CardTitle className="text-lg">{impl.project}</CardTitle>
              <p className="text-sm text-muted-foreground">{impl.client}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Due: {impl.deadline}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    impl.status === 'on-track' ? 'default' :
                    impl.status === 'at-risk' ? 'secondary' : 'outline'
                  }>
                    {impl.status}
                  </Badge>
                </div>
                <Progress value={
                  impl.status === 'completed' ? 100 :
                  impl.status === 'on-track' ? 75 : 45
                } className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Risk Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Risk Alerts
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="font-medium text-sm">CRM Migration - Resource Constraint</p>
              <p className="text-xs text-muted-foreground">Critical path delayed by 3 days due to staffing shortage</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}