import React, { useState } from 'react';
import DepartmentNavBar from '../components/DepartmentNavBar';
import { DEPARTMENT_NAV_BARS } from '../config/department-navbars';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, GitBranch, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function DevelopmentHub() {
  const [selectedBoard, setSelectedBoard] = useState('active');

  const sprints = [
    { id: 1, name: "Sprint 23", progress: 85, tasks: { total: 12, completed: 10 } },
    { id: 2, name: "Sprint 24", progress: 45, tasks: { total: 15, completed: 7 } },
    { id: 3, name: "Backlog", progress: 0, tasks: { total: 23, completed: 0 } }
  ];

  const repositories = [
    { name: "frontend-platform", status: "active", branch: "main", lastCommit: "2 hours ago" },
    { name: "api-services", status: "active", branch: "develop", lastCommit: "1 day ago" },
    { name: "mobile-app", status: "in-progress", branch: "feature/auth", lastCommit: "3 hours ago" }
  ];

  return (
    <div className="p-6 space-y-6">
      <DepartmentNavBar links={DEPARTMENT_NAV_BARS.development} />

      {/* Department Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Project Development</h1>
          <p className="text-muted-foreground">Code repositories, sprint boards, and deployment pipelines</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Sprint Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sprints.map((sprint) => (
          <Card key={sprint.id}>
            <CardHeader>
              <CardTitle className="text-lg">{sprint.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{sprint.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${sprint.progress}%` }}
                  ></div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {sprint.tasks.completed}/{sprint.tasks.total} tasks completed
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Repository Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Code Repositories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {repositories.map((repo) => (
              <div key={repo.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{repo.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Branch: {repo.branch} • Last commit: {repo.lastCommit}
                  </div>
                </div>
                <Badge variant={repo.status === 'active' ? 'default' : 'secondary'}>
                  {repo.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <Card>
        <CardHeader>
          <CardTitle>Development Board</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {['To Do', 'In Progress', 'Review', 'Done'].map((column) => (
              <div key={column} className="border rounded-lg p-3">
                <h3 className="font-medium mb-3">{column}</h3>
                <div className="space-y-2">
                  {column === 'To Do' && (
                    <div className="p-2 bg-gray-50 rounded border">
                      <div className="font-medium text-sm">Implement CI/CD Pipeline</div>
                      <Badge variant="outline" className="text-xs">High Priority</Badge>
                    </div>
                  )}
                  {column === 'In Progress' && (
                    <div className="p-2 bg-gray-50 rounded border">
                      <div className="font-medium text-sm">API Rate Limiting</div>
                      <Badge variant="outline" className="text-xs">Medium Priority</Badge>
                    </div>
                  )}
                  {column === 'Review' && (
                    <div className="p-2 bg-gray-50 rounded border">
                      <div className="font-medium text-sm">Mobile App Auth Module</div>
                      <Badge variant="outline" className="text-xs">Review</Badge>
                    </div>
                  )}
                  {column === 'Done' && (
                    <div className="p-2 bg-gray-50 rounded border">
                      <div className="font-medium text-sm">Q3 Feature Launch</div>
                      <Badge variant="outline" className="text-xs">Completed</Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Input placeholder="Search repositories..." className="max-w-xs" />
        <Button variant="outline">Deploy</Button>
        <Button variant="outline">Pipeline Status</Button>
      </div>
    </div>
  );
}