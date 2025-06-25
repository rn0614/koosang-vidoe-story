import React, { useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/i18n/navigation';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/utils/supabase/client';

interface QuestionTemplateListProps {
  templates: any[];
  companyId: number | string | undefined;
}

export function QuestionTemplateList({ templates, companyId }: QuestionTemplateListProps) {
  const { toast } = useToast();
  const supabase = createClient();


  // 바로 보내기 기능
  const handleSendNow = useCallback(async (template: any) => {
    if (!companyId || !template) {
      toast({ title: '오류', description: '회사 또는 템플릿이 선택되지 않았습니다.', variant: 'destructive' });
      return;
    }
    try {
      const { data: customers, error: customerError } = await supabase
        .from('customers')
        .select('id, name')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .eq('notification_enabled', true);
      if (customerError) throw customerError;
      if (!customers || customers.length === 0) {
        toast({ title: '알림', description: '알림을 받을 수 있는 활성 고객이 없습니다.', variant: 'destructive' });
        return;
      }
      toast({ title: '알림', description: `${customers.map((customer: any) => customer.name).join(', ')} 고객에게 알림을 발송합니다.`, variant: 'destructive' });
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().slice(0, 5);
      const notificationSchedules = customers.map((customer: any) => ({
        company_id: companyId,
        customer_id: customer.id,
        question_template_id: template.id,
        prescription_id: null,
        scheduled_date: currentDate,
        scheduled_time: currentTime,
        status: 'sent',
        sent_at: now.toISOString(),
        expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        retry_count: 0,
      }));
      const { error: insertError } = await supabase
        .from('notification_schedules')
        .insert(notificationSchedules);
      if (insertError) throw insertError;
      toast({ title: '발송 완료', description: `${customers.length}명의 고객에게 즉시 알림이 발송되었습니다.` });
    } catch (err: any) {
      console.error('즉시 발송 오류:', err);
      toast({ title: '발송 실패', description: '알림 발송 중 오류가 발생했습니다: ' + err.message, variant: 'destructive' });
    }
  }, [supabase, toast]);



  if (!templates || templates.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        아직 생성된 템플릿이 없습니다.
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {templates.map((template: any) => (
        <Card key={template.id} className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <div className="mb-2 flex items-start justify-between">
              <h3 className="text-lg font-semibold">
                {template.template_name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {template.schedule_type} {template.schedule_time}
                </span>
                <Link href={`/alarm/company/${template.id}`} scroll={false}>
                  <Button size="icon" variant="ghost" aria-label="수정">
                    ✏️
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSendNow(template)}
                >
                  바로 발송
                </Button>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  {template.is_active ? 'active' : 'inactive'}
                </Badge>
              </div>
            </div>
            <p className="mb-3 text-muted-foreground">
              {template.question_text}
            </p>
            {template.options && (
              <div className="mb-3 flex flex-wrap gap-2">
                {template.options.map((option: string, idx: number) => (
                  <Badge key={idx} variant="outline">
                    {option}
                  </Badge>
                ))}
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              생성: {new Date(template.created_at).toLocaleString('ko-KR')}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
