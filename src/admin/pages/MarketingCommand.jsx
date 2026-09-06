import React from 'react';
import DepartmentNavBar from '../components/DepartmentNavBar';
import { DEPARTMENT_NAV_BARS } from '../config/department-navbars';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Target, Download } from 'lucide-react';

export default function MarketingCommand() {
  const campaignPerformance = [
    { month: 'Dec', clicks: 1200, conversions: 89, spent: 450 },
    { month: 'Jan', clicks: 1800, conversions: 134, spent: 620 },
    { month: 'Feb', clicks: 1500, conversions: 98, spent: 510 },
    { month: 'Mar', clicks: 2200, conversions: 178, spent: 780 },
    { month: 'Apr', clicks: 2800, conversions: 234, spent: 920 },
    { month: 'May', clicks: 3200, conversions: 312, spent: 1100 }
  ];

  const activeCampaigns = [
    { id: 1, name: "Q2 Newsletter Campaign", channel: "Email", status: "active", budget: 800, spent: 450 },
    { id: 2, name: "LinkedIn Ads - Tech Sector", channel: "Social", status: "active", budget: 1500, spent: 980 },
    { id: 3, name: "Industry Whitepaper", channel: "Content", status: "planned", budget: 500, spent: 0 }
  ];

  const kpis = {
    totalReach: "45.2K",
    engagementRate: "4.8%",
    leadGeneration: 312,
    roi: "342%"
  };

  return (
    <div className="p-6 space-y-6">
      <DepartmentNavBar links={DEPARTMENT_NAV_BARS.marketing} />

      {/* Department Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Marketing & Communications</h1>
          <p className="text-muted-foreground">Campaign dashboards, content calendar, and analytics</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Total Reach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{kpis.totalReach}</p>
            <p className="text-sm text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Engagement Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{kpis.engagementRate}</p>
            <p className="text-sm text-muted-foreground">+0.3% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Lead Generation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{kpis.leadGeneration}</p>
            <p className="text-sm text-muted-foreground">+18% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Campaign ROI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{kpis.roi}</p>
            <p className="text-sm text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={campaignPerformance}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Active Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeCampaigns.map((campaign) => (
              <div key={campaign.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="font-medium">{campaign.name}</h3>
                    <p className="text-sm text-muted-foreground">Channel: {campaign.channel}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span>Budget: ${campaign.budget}</span>
                      <span>Spent: ${campaign.spent}</span>
                      <span>Remaining: ${campaign.budget - campaign.spent}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                      {campaign.status}
                    </Badge>
                    <Button size="sm" variant="outline">Details</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}