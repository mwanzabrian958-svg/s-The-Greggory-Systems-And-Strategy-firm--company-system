import React from 'react';
import DepartmentNavBar from '../components/DepartmentNavBar';
import { DEPARTMENT_NAV_BARS } from '../config/department-navbars';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, TrendingUp, Target, PieChart } from 'lucide-react';

export default function SalesHub() {
  const leads = [
    { id: 1, company: "TechGlobal Inc", value: "$45K", stage: "Proposal", probability: 75, lastContact: "2 days ago" },
    { id: 2, company: "FinServe Ltd", value: "$32K", stage: "Negotiation", probability: 85, lastContact: "1 day ago" },
    { id: 3, company: "RetailCorp", value: "$28K", stage: "Prospecting", probability: 40, lastContact: "3 days ago" }
  ];

  const pipeline = [
    { stage: "Prospecting", count: 24, value: "$1.2M" },
    { stage: "Qualified", count: 18, value: "$980K" },
    { stage: "Proposal", count: 12, value: "$720K" },
    { stage: "Negotiation", count: 8, value: "$450K" },
    { stage: "Closed", count: 15, value: "$680K" }
  ];

  const forecast = {
    totalPipeline: "$3.45M",
    weightedForecast: "$2.1M",
    closeRate: 68
  };

  return (
    <div className="p-6 space-y-6">
      <DepartmentNavBar links={DEPARTMENT_NAV_BARS.sales} />

      {/* Department Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Sales & Client Relations</h1>
          <p className="text-muted-foreground">CRM pipeline, lead tracking, and contract management</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Lead
        </Button>
      </div>

      {/* Pipeline Forecast */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Total Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{forecast.totalPipeline}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Weighted Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{forecast.weightedForecast}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Close Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{forecast.closeRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Pipeline by Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pipeline.map((stage) => (
              <div key={stage.stage} className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium">{stage.stage}</div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-100 rounded-lg relative">
                    <div 
                      className="h-full bg-blue-600 rounded-lg flex items-center justify-end pr-2"
                      style={{ width: `${(stage.count / 24) * 100}%` }}
                    >
                      <span className="text-xs text-white font-medium">
                        {stage.count} deals • {stage.value}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Leads */}
      <Card>
        <CardHeader>
          <CardTitle>Active Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leads.map((lead) => (
              <div key={lead.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="font-medium">{lead.company}</h3>
                    <p className="text-sm text-muted-foreground">
                      Value: {lead.value} • Stage: {lead.stage}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last contact: {lead.lastContact}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{lead.probability}% probability</Badge>
                    <Button size="sm" variant="outline">View Details</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Input placeholder="Search leads..." className="max-w-xs" />
        <Button variant="outline">Contracts</Button>
        <Button variant="outline">Reports</Button>
      </div>
    </div>
  );
}