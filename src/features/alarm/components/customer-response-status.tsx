import React, { useEffect, useState } from 'react';
import { createClient } from '@/shared/lib/supabase/client';

interface CustomerResponseStatusProps {
  companyId: number | string | undefined;
}

export function CustomerResponseStatus({ companyId }: CustomerResponseStatusProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    setError(null);

    async function fetchData() {
      try {
        // 1. 회사의 모든 고객 조회
        const { data: customers, error: customerError } = await supabase
          .from('customers')
          .select('id, name')
          .eq('company_id', Number(companyId))
          .eq('is_active', true);

        if (customerError) throw customerError;
/*
        // 2. 각 고객별 최근 응답 조회 (병렬)
        const results = await Promise.all(
          (customers || []).map(async (customer: any) => {
            // 최근 응답
            const { data: lastResponse } = await supabase
              .from('customer_responses')
              .select('responded_at, answer, question_templates(template_name, question_text)')
              .eq('customer_id', customer.id)
              .order('responded_at', { ascending: false })
              .limit(1)
              .single();

            // 미응답 알림 개수
            const { count: pendingCount } = await supabase
              .from('notification_schedules')
              .select('id', { count: 'exact', head: true })
              .eq('customer_id', customer.id)
              .eq('status', 'sent')
              .neq('delete_yn', true)
              .not('id', 'in', `(${supabase
                .from('customer_responses')
                .select('notification_schedule_id')
                .eq('customer_id', customer.id)
                .toString()})`);

            return {
              name: customer.name,
              lastRespondedAt: lastResponse?.responded_at,
              lastAnswer: lastResponse?.answer,
              lastQuestion: lastResponse?.question_templates?.[0]?.question_text,
              pendingCount: pendingCount || 0,
            };
          })
        );
        setRows(results);

        */
      } catch (err: any) {
        setError(err.message || '에러 발생');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [companyId, supabase]);

  if (!companyId) return <div className="text-center py-8 text-muted-foreground">회사를 선택하세요.</div>;
  if (loading) return <div className="text-center py-8">로딩 중...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
  if (!rows.length) return <div className="text-center py-8 text-muted-foreground">고객 데이터가 없습니다.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th className="px-2 py-1">고객명</th>
            <th className="px-2 py-1">최근 응답일</th>
            <th className="px-2 py-1">최근 답변</th>
            <th className="px-2 py-1">미응답 알림</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="border-b">
              <td className="px-2 py-1">{row.name}</td>
              <td className="px-2 py-1">{row.lastRespondedAt ? new Date(row.lastRespondedAt).toLocaleString('ko-KR') : '-'}</td>
              <td className="px-2 py-1">{row.lastAnswer || '-'}</td>
              <td className="px-2 py-1">{row.pendingCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
