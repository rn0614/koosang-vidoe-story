'use client';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useCompanies } from '@/hooks/useCompanies';
import { CompanyView } from '@/components/alarm/company-view';

export default function CompanyAlarmPage() {
  const {
    data: companies = [],
    isLoading: companiesLoading,
    isError: companiesError,
    error: companiesErrorObj,
  } = useCompanies();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl p-4">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h1 className="mb-4 text-3xl font-bold text-foreground">
              🏢 약국/병원 관리자
            </h1>
            <CompanyView
              companies={companies}
              companiesLoading={companiesLoading}
              companiesError={companiesError}
              companiesErrorObj={companiesErrorObj}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
