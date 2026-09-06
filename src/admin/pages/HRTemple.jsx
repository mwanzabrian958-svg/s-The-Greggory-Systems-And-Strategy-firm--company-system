import React from 'react';
import DepartmentNavBar from '../components/DepartmentNavBar';
import { DEPARTMENT_NAV_BARS } from '../config/department-navbars';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, FileText, Plus } from 'lucide-react';

export default function HRTemple() {
  const teamMembers = [
    { id: 1, name: "Brian Mwanza", role: "CEO & Founder", department: "Executive", status: "active" },
    { id: 2, name: "Sarah Johnson", role: "Lead Developer", department: "Project Development", status: "active" },
    { id: 3, name: "Michael Chen", role: "Senior Designer", department: "Design Studio", status: "active" },
    { id: 4, name: "Emma Wilson", role: "Financial Analyst", department: "Finance & Legal", status: "active" }
  ];

  const trainingPrograms = [
    { id: 1, name: "Advanced React Patterns", date: "2024-05-20", status: "upcoming" },
    { id: 2, name: "Financial Modeling Workshop", date: "2024-05-15", status: "completed" },
    { id: 3, name: "Leadership Development", date: "2024-06-01", status: "registration" }
  ];

  const performanceReviews = [
    { id: 1, employee: "Sarah Johnson", quarter: "Q1 2024", status: "completed" },
    { id: 2, employee: "Michael Chen", quarter: "Q1 2024", status: "pending" },
    { id: 3, employee: "Emma Wilson", quarter: "Q1 2024", status: "pending" }
  ];

  return (
    <div className="p-6 space-y-6">
      <DepartmentNavBar links={DEPARTMENT_NAV_BARS.hr} />

      {/* Department Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Human Resources</h1>
          <p className="text-muted-foreground">Employee records, performance reviews, and training schedules</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      {/* Team Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm font-medium">
              <span>Name</span>
              <span className="w-40">Role</span>
              <span className="w-40">Department</span>
              <span>Status</span>
            </div>
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                  <span className="font-medium">{member.name}</span>
                </div>
                <span className="w-40 text-sm">{member.role}</span>
                <span className="w-40 text-sm">{member.department}</span>
                <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                  {member.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Training Programs */}
      <Card>
        <CardHeader>
          <CardTitle>Training Programs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trainingPrograms.map((program) => (
              <div key={program.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <h3 className="font-medium">{program.name}</h3>
                  <p className="text-sm text-muted-foreground">Scheduled: {program.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    program.status === 'completed' ? 'default' :
                    program.status === 'upcoming' ? 'secondary' : 'outline'
                  }>
                    {program.status}
                  </Badge>
                  <Button size="sm" variant="outline">
                    {program.status === 'registration' ? 'Register' : 'View'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {performanceReviews.map((review) => (
              <div key={review.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <h3 className="font-medium">{review.employee}</h3>
                  <p className="text-sm text-muted-foreground">{review.quarter}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={review.status === 'completed' ? 'default' : 'secondary'}>
                    {review.status}
                  </Badge>
                  <Button size="sm" variant="outline" disabled={review.status === 'pending'}>
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Meeting
        </Button>
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Generate Reports
        </Button>
      </div>
    </div>
  );
}