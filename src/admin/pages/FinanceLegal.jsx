import React from 'react';
import DepartmentNavBar from '../components/DepartmentNavBar';
import { DEPARTMENT_NAV_BARS } from '../config/department-navbars';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, Download, Calendar } from 'lucide-react';

export default function FinanceLegal() {
  const financialMetrics = {
    monthlyRevenue: "2.4M KES",
    monthlyExpenses: "1.8M KES",
    netIncome: "600K KES",
    cashReserves: "12.4M KES"
  };

  const budgetCategories = [
    { id: 1, name: "Salaries & Benefits", allocated: 1200000, spent: 1150000, category: "operational" },
    { id: 2, name: "Infrastructure", allocated: 800000, spent: 720000, category: "operational" },
    { id: 3, name: "Marketing & Branding", allocated: 500000, spent: 450000, category: "growth" },
    { id: 4, name: "Research & Development", allocated: 300000, spent: 280000, category: "strategic" }
  ];

  const invoices = [
    { id: 1, number: "INV-0001", client: "TechGlobal Inc", amount: 85000, status: "paid", date: "2024-05-01" },
    { id: 2, number: "INV-0002", client: "FinServe Ltd", amount: 120000, status: "sent", date: "2024-05-03" },
    { id: 3, number: "INV-0003", client: "RetailCorp", amount: 65000, status: "draft", date: "2024-05-05" }
  ];

  const contracts = [
    { id: 1, title: "Software Development Agreement", client: "Globex Corp", status: "active", expires: "2025-03-15" },
    { id: 2, title: "Consulting Services Contract", client: "Initech", status: "active", expires: "2024-12-31" },
    { id: 3, title: "Cloud Services Agreement", client: "Umbrella Inc", status: "pending", expires: "N/A" }
  ];

  return (
    <div className="p-6 space-y-6">
      <DepartmentNavBar links={DEPARTMENT_NAV_BARS['finance-legal']} />

      {/* Department Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Finance & Legal</h1>
          <p className="text-muted-foreground">Financial reporting, contract management, and legal documents</p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          New Contract
        </Button>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(financialMetrics).map(([key, value]) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Budget Allocation */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgetCategories.map((category) => {
              const spentPercent = (category.spent / category.allocated) * 100;
              return (
                <div key={category.id} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(spentPercent)}% (${category.spent.toLocaleString()} of ${category.allocated.toLocaleString()})
                    </span>
                  </div>
                  <Progress value={spentPercent} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{invoice.number} - {invoice.client}</div>
                  <p className="text-sm text-muted-foreground">{invoice.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">{invoice.amount.toLocaleString()} KES</span>
                  <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                    {invoice.status}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Contracts */}
      <Card>
        <CardHeader>
          <CardTitle>Legal Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {contracts.map((contract) => (
              <div key={contract.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="font-medium">{contract.title}</h3>
                    <p className="text-sm text-muted-foreground">Client: {contract.client}</p>
                    <p className="text-sm">Expires: {contract.expires}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
                      {contract.status}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Generate Financial Report
        </Button>
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          Tax Calendar
        </Button>
      </div>
    </div>
  );
}