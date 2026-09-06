import React, { useState } from 'react';
import DepartmentNavBar from '../components/DepartmentNavBar';
import { DEPARTMENT_NAV_BARS } from '../config/department-navbars';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Image as ImageIcon, FileText, Palette } from 'lucide-react';

export default function DesignStudio() {
  const [activeTab, setActiveTab] = useState('assets');

  const assets = [
    { id: 1, name: "Brand Guidelines v3", type: "PDF", size: "2.4MB", date: "2024-01-15" },
    { id: 2, name: "Logo Variations", type: "AI", size: "5.2MB", date: "2024-01-10" },
    { id: 3, name: "Mobile App Wireframes", type: "Figma", size: "12MB", date: "2024-01-05" }
  ];

  const prototypes = [
    { id: 1, name: "Dashboard Redesign", status: "In Development", progress: 65 },
    { id: 2, name: "Mobile App UI", status: "Testing", progress: 90 },
    { id: 3, name: "Client Portal", status: "Review", progress: 85 }
  ];

  return (
    <div className="p-6 space-y-6">
      <DepartmentNavBar links={DEPARTMENT_NAV_BARS.design} />

      {/* Department Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Design Studio</h1>
          <p className="text-muted-foreground">Asset library, prototypes, and brand guideline tools</p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Asset
        </Button>
      </div>

      {/* Asset Library Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="assets">Asset Library</TabsTrigger>
          <TabsTrigger value="prototypes">Prototypes</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
        </TabsList>

        <TabsContent value="assets">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {assets.map((asset) => (
              <Card key={asset.id}>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <FileText className="h-10 w-10 mx-auto text-gray-400" />
                    <h3 className="font-medium">{asset.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {asset.type} • {asset.size}
                    </p>
                    <Badge variant="outline">{asset.date}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="prototypes">
          <div className="space-y-4">
            {prototypes.map((proto) => (
              <Card key={proto.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{proto.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Status</span>
                      <Badge variant="outline">{proto.status}</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{proto.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${proto.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Brand Color Palette</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {['#002D62', '#D4AF37', '#FFFFFF', '#000000'].map((color) => (
                  <div key={color} className="flex items-center gap-2">
                    <div 
                      className="w-12 h-12 rounded border" 
                      style={{ backgroundColor: color }}
                    ></div>
                    <code className="text-sm">{color}</code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}