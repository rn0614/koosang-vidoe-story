import { AiCarousel } from '@/components/ai-carousel';
import { RagTop3Table } from '@/components/rag-top3';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { Metadata } from 'next';
import { RagTrendChart } from '@/components/rag-trend-chart';
import { AiImageTrendChart } from '@/components/ai-image-trend-chart';
import { NewsCountCard } from '@/components/news-count-card';
import { NewsTop3Table } from '@/components/news-top3';
import { RagPostCountCard } from '@/components/rag-post-count-card';
import { AiImageCountCard } from '@/components/ai-image-count-card';
export const metadata: Metadata = {
  title: 'Dashboard | 서비스명',
  description: '대시보드에서 최근 활동, 통계, AI 뉴스 등을 확인하세요.',
  keywords: ['dashboard', 'AI', '통계', '뉴스'],
  openGraph: {
    title: 'Dashboard | 서비스명',
    description: '대시보드에서 최근 활동, 통계, AI 뉴스 등을 확인하세요.',
    type: 'website',
  },
};

export default function DashboardPage() {
  const t = useTranslations();
  return (
    <div className="p-4">
      {/* 추가 통계 카드 */}
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <NewsCountCard />
        <RagPostCountCard />
        <AiImageCountCard />
      </div>

      {/* 차트 영역 */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>RAG 포스팅 주간 추세</CardTitle>
            <CardDescription>
              최근 한달간 주간별 변경된 글 작성 현황
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RagTrendChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>AI 이미지 생성 추세</CardTitle>
            <CardDescription>AI 이미지 관련 활동 추세</CardDescription>
          </CardHeader>
          <CardContent>
            <AiImageTrendChart />
          </CardContent>
        </Card>
      </div>

      {/* 기존 컨텐츠 영역 */}
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>{t('dashboard.recent_my_rag_note')}</CardTitle>
            <CardDescription>{t('dashboard.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <RagTop3Table />
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>{t('dashboard.recent_ai_news_from_google')}</CardTitle>
            <CardDescription>{t('dashboard.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <NewsTop3Table />
          </CardContent>
        </Card>
      </div>
      <div className="my-4">
        <AiCarousel />
      </div>
    </div>
  );
}
