import React from 'react';
import DepartmentNavBar from '../components/DepartmentNavBar';
import { DEPARTMENT_NAV_BARS } from '../config/department-navbars';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, Truck, ClipboardList, Wrench } from 'lucide-react';

export default function OperationsCenter() {
  const facilities = [
    { id: 1, name: "HQ Office - Westlands", status: "operational", occupancy: "85%", issues: 0 },
    { id: 2, name: "Branch - Mombasa", status: "operational", occupancy: "60%", issues: 1 },
    { id: 3, name: "Data Center Room", status: "maintenance", occupancy: "N/A", issues: 2 }
  ];

  const vendors = [
    { id: 1, name: "SkyNet Internet Services", service: "Connectivity", contract: "Active", renewal: "2025-01-15" },
    { id: 2, name: "OfficeMart Supplies", service: "Stationery", contract: "Active", renewal: "2024-12-01" },
    { id: 3, name: "SecureGuard Ltd", service: "Security", contract: "Review", renewal: "2024-11-30" }
  ];

  const tasks = [
    { id: 1, title: "Quarterly facility audit", priority: "high", due: "2024-06-01", assignee: "Admin Team" },
    { id: 2, title: "Server room cooling maintenance", priority: "critical", due: "2024-05-28", assignee: "Tech Vendor" },
    { id: 3, title: "Office supplies restock", priority: "low", due: "2024-06-10", assignee: "Procurement" }
  ];

  return (
    <div className="p-6 space-y-6">
      <DepartmentNavBar links={DEPARTMENT_NAV_BARS.operations} />

      {/* Department Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Operations</h1>
        <p className="text-muted-foreground">Facilities, procurement, vendors, and administrative coordination</p>
      </div>

      {/* Facility Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {facilities.map((facility) => (
          <Card key={facility.id}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5" />
                {facility.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Status</span>
                  <Badge variant={facility.status === 'operational' ? 'default' : 'secondary'}>
                    {facility.status}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Occupancy</span>
                  <span className="font-medium">{facility.occupancy}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Open Issues</span>
                  <span className={facility.issues > 0 ? 'text-red-600 font-medium' : ''}>
                    {facility.issues}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Vendor Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Vendor Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <h3 className="font-medium">{vendor.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {vendor.service} • Renews: {vendor.renewal}
                  </p>
                </div>
                <Badge variant={vendor.contract === 'Active' ? 'default' : 'secondary'}>
                  {vendor.contract}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Operational Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Operational Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Due: {task.due} • {task.assignee}
                  </p>
                </div>
                <Badge variant={
                  task.priority === 'critical' ? 'destructive' :
                  task.priority === 'high' ? 'default' : 'secondary'
                }>
                  {task.priority}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button variant="outline">
          <Building className="h-4 w-4 mr-2" />
          Facility Report
        </Button>
        <Button variant="outline">
          <Wrench className="h-4 w-4 mr-2" />
          Log Maintenance
        </Button>
      </div>
    </div>
  );
}