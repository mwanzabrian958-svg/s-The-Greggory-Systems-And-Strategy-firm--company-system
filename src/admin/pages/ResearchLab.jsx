import React from 'react';
import DepartmentNavBar from '../components/DepartmentNavBar';
import { DEPARTMENT_NAV_BARS } from '../config/department-navbars';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Database, Search, FileText, Download } from 'lucide-react';

export default function ResearchLab() {
  const researchData = [
    { category: "Market Analysis", value: 45 },
    { category: "User Behavior", value: 38 },
    { category: "Competitive Intel", value: 32 },
    { category: "Technology Trends", value: 28 },
    { category: "Industry Benchmarks", value: 41 }
  ];

  const reports = [
    { id: 1, name: "Q2 Market Analysis Report", type: "PDF", date: "2024-05-15", size: "2.4MB" },
    { id: 2, name: "User Behavior Study", type: "PPTX", date: "2024-04-28", size: "15MB" },
    { id: 3, name: "Competitive Landscape Q2", type: "XLSX", date: "2024-05-01", size: "3.1MB" }
  ];

  return (
    <div className="p-6 space-y-6">
      <DepartmentNavBar links={DEPARTMENT_NAV_BARS.research} />

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Research & Analytics</h1>
        <p className="text-muted-foreground">Data visualization, market research, and insight reports</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Research Data Insights</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={researchData}>
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="reports">
        <TabsList>
          <TabsTrigger value="reports">Insight Reports</TabsTrigger>
          <TabsTrigger value="data">Data Sources</TabsTrigger>
          <TabsTrigger value="trends">Industry Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <Card>
            <CardHeader><CardTitle>Recent Reports</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-gray-400" />
                      <div>
                        <h3 className="font-medium">{report.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {report.type} • {report.date} • {report.size}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline"><Download className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
                </TabsContent>
        
        <TabsContent value="data">
          <Card>
            <CardHeader><CardTitle>Data Sources</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Sales Database", type: "MySQL", status: "Connected" },
                  { name: "Web Analytics", type: "Google Analytics", status: "Connected" },
                  { name: "Social Media API", type: "API", status: "Connected" },
                  { name: "Industry Reports", type: "CSV/Excel", status: "Pending" }
                ].map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Database className="h-5 w-5 text-gray-400" />
                      <div>
                        <h3 className="font-medium">{source.name}</h3>
                        <p className="text-sm text-muted-foreground">{source.type}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${source.status === 'Connected' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {source.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends">
          <Card>
            <CardHeader><CardTitle>Key Industry Trends</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">AI in Business Services (2024)</h3>
                  <p className="text-sm text-muted-foreground mb-2">Adoption increasing 45% YoY across all sectors</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Remote Work Productivity (2024)</h3>
                  <p className="text-sm text-muted-foreground mb-2">78% of companies report stable or increased productivity</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2">
        <Button variant="outline"><Search className="h-4 w-4 mr-2" />Run Analysis</Button>
        <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export Data</Button>
      </div>
    </div>
  );
}