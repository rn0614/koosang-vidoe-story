import { AiCarousel } from '@/components/ai-carousel';
import { CarouselDemo } from '@/components/mobile-carousel';
import { RagTop3Table } from '@/components/rag-top3';
import { StatCard } from '@/components/state-card';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Activity, CreditCard, DollarSign, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export default function DashboardPage() {
  const t = useTranslations();
  return (
    <div className="p-4">
      <AiCarousel />
      <Separator className="my-4" />
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={45231.89}
          description="+20.1% from last month"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          trend="up"
        />
        <StatCard
          title="Subscriptions"
          value={2350}
          description="+180 from last week"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          trend="up"
        />
        <StatCard
          title="Sales"
          value={12234}
          description="-19 from yesterday"
          icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
          trend="down"
        />
        <StatCard
          title="Active Users"
          value={573}
          description="+201 since last hour"
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          trend="up"
        />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t('dashboard.recent_my_rag_note')}</CardTitle>
            <CardDescription>{t('dashboard.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <RagTop3Table />
          </CardContent>
        </Card>
        <Card className="col-span-4 md:col-span-3">
          <CardHeader>
            <CardTitle>{t('dashboard.recent_ai_news_from_google')}</CardTitle>
            <CardDescription>{t('dashboard.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <RagTop3Table />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
