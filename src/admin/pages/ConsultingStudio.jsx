import React from 'react';
import DepartmentNavBar from '../components/DepartmentNavBar';
import { DEPARTMENT_NAV_BARS } from '../config/department-navbars';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, FileText, Users, Clock } from 'lucide-react';

export default function ConsultingStudio() {
  const cases = [
    { id: 1, title: "Process Optimization - Manufacturing", client: "Globex Corp", status: "completed", value: "$120K" },
    { id: 2, title: "Market Entry Strategy - APAC", client: "Initech", status: "in-progress", value: "$85K" },
    { id: 3, title: "Digital Transformation Roadmap", client: "Umbrella Inc", status: "planning", value: "$150K" }
  ];

  const methodologies = [
    { name: "Lean Six Sigma", description: "Operational efficiency improvement" },
    { name: "Design Thinking", description: "Customer-centric innovation" },
    { name: "Change Management", description: "Organizational transformation" }
  ];

  return (
    <div className="p-6 space-y-6">
      <DepartmentNavBar links={DEPARTMENT_NAV_BARS.consulting} />

      {/* Department Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Business Consulting</h1>
          <p className="text-muted-foreground">Client case studies, process maps, and improvement trackers</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Case Study
        </Button>
      </div>

      {/* Active Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Client Engagements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cases.map((caseItem) => (
              <div key={caseItem.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="font-medium">{caseItem.title}</h3>
                    <p className="text-sm text-muted-foreground">Client: {caseItem.client}</p>
                    <p className="text-sm">Value: {caseItem.value}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={caseItem.status === 'completed' ? 'default' : 'secondary'}>
                      {caseItem.status}
                    </Badge>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Methodologies */}
      <Card>
        <CardHeader>
          <CardTitle>Consulting Methodologies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {methodologies.map((method) => (
              <Card key={method.name}>
                <CardHeader>
                  <CardTitle className="text-lg">{method.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Consulting Team</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
              ))}
            </div>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Specialist
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Input placeholder="Search cases..." className="max-w-xs" />
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-1" />
          Reports
        </Button>
        <Button variant="outline">
          <Users className="h-4 w-4 mr-1" />
          Team Directory
        </Button>
      </div>
    </div>
  );
}