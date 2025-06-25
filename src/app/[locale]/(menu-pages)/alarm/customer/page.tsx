"use client"
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CustomerView } from '@/components/alarm/customer-view';

export default function CustomerAlarmPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h1 className="text-3xl font-bold text-foreground mb-4">👤 고객</h1>
            <CustomerView />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
