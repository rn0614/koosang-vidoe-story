"use client"
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';

export default function HealthCheckMVP() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 space-y-8">
        {/* Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-foreground">건강 체크 알림 서비스</h1>
            </div>
          </CardContent>
        </Card>
        {/* 이동 버튼 */}
        <Card>
          <CardContent className="flex flex-col gap-6 items-center py-12">
            <Link href="/alarm/company">
              <button className="px-8 py-4 rounded-lg bg-blue-600 text-white text-xl font-semibold hover:bg-blue-700 transition">🏢 약국/병원 관리자 화면으로 이동</button>
            </Link>
            <Link href="/alarm/customer">
              <button className="px-8 py-4 rounded-lg bg-green-600 text-white text-xl font-semibold hover:bg-green-700 transition">👤 고객 화면으로 이동</button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}