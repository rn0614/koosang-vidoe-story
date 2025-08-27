'use client';
import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Link } from '@/shared/lib/i18n/navigation';
import { Button } from '@/shared/ui/button';

export default function HealthCheckMVP() {
  return (
    <div className="bg-background">
      <div className="mx-auto max-w-4xl space-y-8 p-4">
        {/* Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground">
                건강 체크 알림 서비스
              </h1>
            </div>
          </CardContent>
        </Card>
        {/* 이동 버튼 */}
        <Card>
          <CardContent className="flex flex-col items-center gap-6 py-12">
            <Link href="/alarm/company">
              <Button>🏢 약국/병원 관리자 화면으로 이동</Button>
            </Link>
            <Link href="/alarm/customer">
              <Button>👤 고객 화면으로 이동</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
