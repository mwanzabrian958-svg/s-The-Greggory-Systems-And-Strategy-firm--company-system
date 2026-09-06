import React from 'react';
import DepartmentNavBar from '../components/DepartmentNavBar';
import { DEPARTMENT_NAV_BARS } from '../config/department-navbars';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Server, Shield, HardDrive, Activity } from 'lucide-react';

export default function TechServices() {
  const services = [
    { id: 1, name: "Production API Servers", status: "operational", uptime: 99.9, load: 65 },
    { id: 2, name: "Database Cluster", status: "operational", uptime: 99.98, load: 42 },
    { id: 3, name: "CI/CD Pipeline", status: "operational", uptime: 98.5, load: 30 },
    { id: 4, name: "Monitoring Stack", status: "warning", uptime: 95.0, load: 80 }
  ];

  const recentIncidents = [
    { id: 1, service: "API Server 2", type: "High CPU", resolved: true, time: "2 hours ago" },
    { id: 2, service: "Database Replica", type: "Connection Pool", resolved: false, time: "5 hours ago" }
  ];

  return (
    <div className="p-6 space-y-6">
      <DepartmentNavBar links={DEPARTMENT_NAV_BARS.tech} />

      {/* Department Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Technology Services</h1>
        <p className="text-muted-foreground">Infrastructure monitoring, security, and DevOps operations</p>
      </div>

      {/* Service Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((service) => (
          <Card key={service.id}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {service.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Status</span>
                  <Badge variant={service.status === 'operational' ? 'default' : 'secondary'}>
                    {service.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Uptime</span>
                  <span className="font-medium">{service.uptime}%</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>System Load</span>
                    <span>{service.load}%</span>
                  </div>
                  <Progress value={service.load} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Infrastructure Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Server className="h-5 w-5" />
              Servers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">6 active, 4 standby, 2 maintenance</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">98.7%</p>
              <p className="text-sm text-muted-foreground">Threat protection score</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">7.2TB</p>
              <p className="text-sm text-muted-foreground">Used of 10TB total</p>
              <Progress value={72} className="mt-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Incident Log */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentIncidents.map((incident) => (
              <div key={incident.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{incident.service} - {incident.type}</p>
                  <p className="text-sm text-muted-foreground">{incident.time}</p>
                </div>
                <Badge variant={incident.resolved ? "default" : "secondary"}>
                  {incident.resolved ? "Resolved" : "Ongoing"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}