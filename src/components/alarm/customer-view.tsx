import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/utils/supabase/client';

// NotificationCard 타입
interface NotificationCardProps {
  notification: any;
  onRespond: (notificationId: any, responseType: any, value: any, textResponse?: string) => void;
  loading: boolean;
}

const NotificationCard: React.FC<NotificationCardProps> = React.memo(({ notification, onRespond, loading }) => {
  const [selectedOption, setSelectedOption] = React.useState('');
  const [customInput, setCustomInput] = React.useState('');
  const [showCustomInput, setShowCustomInput] = React.useState(false);

  const handleRespond = React.useCallback(() => {
    if (selectedOption) {
      onRespond(notification.id, 'option_selected', selectedOption);
    } else if (customInput) {
      onRespond(notification.id, 'text_input', '', customInput);
    }
    setSelectedOption('');
    setCustomInput('');
    setShowCustomInput(false);
  }, [notification.id, selectedOption, customInput, onRespond]);

  const template = notification.question_templates;
  if (!template) return null;

  return (
    <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-blue-900">{template.template_name}</h3>
            <p className="text-sm text-blue-700">from {notification.companies?.name}</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-blue-600">
            🕒 {notification.scheduled_time}
          </div>
        </div>
        <p className="text-foreground mb-4">{template.question_text}</p>
        <div className="space-y-3">
          {template.question_type === 'single_choice' && template.options && (
            <div className="grid gap-2">
              {template.options.map((option: string, index: number) => (
                <Button
                  key={index}
                  variant={selectedOption === option ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedOption(option);
                    setShowCustomInput(false);
                  }}
                  className="justify-start h-auto p-3 text-left"
                  disabled={loading}
                >
                  {option}
                </Button>
              ))}
              <Button
                variant={showCustomInput ? 'default' : 'outline'}
                onClick={() => {
                  setShowCustomInput(true);
                  setSelectedOption('');
                }}
                className="justify-start h-auto p-3 text-left"
                disabled={loading}
              >
                기타 (직접 입력)
              </Button>
            </div>
          )}
          {template.question_type === 'text' && (
            <Textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="답변을 입력해주세요..."
              rows={3}
              className="border-blue-300 focus:border-blue-500"
              disabled={loading}
            />
          )}
          {showCustomInput && template.question_type !== 'text' && (
            <Textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="상세한 상황을 입력해주세요..."
              rows={3}
              className="border-blue-300 focus:border-blue-500"
              disabled={loading}
            />
          )}
          {(selectedOption || customInput) && (
            <Button onClick={handleRespond} className="w-full" disabled={loading}>
              {loading ? '전송 중...' : '📤 응답 보내기'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
NotificationCard.displayName = 'NotificationCard';

// CustomerView: 고객 관련 데이터/로직을 모두 내부에서 관리
export const CustomerView: React.FC = () => {
  const supabase = createClient();
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [customerResponses, setCustomerResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 고객 목록 불러오기
  useEffect(() => {
    const fetchCustomers = async () => {
      const { data, error } = await supabase.from('customers').select('*').eq('is_active', true);
      if (!error) setCustomers(data || []);
    };
    fetchCustomers();
  }, [supabase]);

  // 고객 선택 시 알림/응답 불러오기
  useEffect(() => {
    if (!selectedCustomer) return;
    loadNotifications();
    loadCustomerResponses();
    // eslint-disable-next-line
  }, [selectedCustomer]);

  const loadNotifications = useCallback(async () => {
    if (!selectedCustomer) return;
    try {
      const { data, error } = await supabase
        .from('notification_schedules')
        .select(`*, question_templates (*), companies (name)`) // join
        .eq('customer_id', selectedCustomer.id)
        .eq('status', 'sent')
        .neq('delete_yn', true)
        .order('scheduled_date', { ascending: false });
      if (error) throw error;
      // 아직 응답하지 않은 알림만 필터링
      const pendingNotifications: any[] = [];
      for (const notification of data || []) {
        const { data: responseData } = await supabase
          .from('customer_responses')
          .select('id')
          .eq('notification_schedule_id', notification.id)
          .single();
        if (!responseData) {
          pendingNotifications.push({
            ...notification,
            status: 'pending',
          });
        }
      }
      setNotifications(pendingNotifications);
    } catch (err) {
      // 에러 무시(간단 처리)
    }
  }, [selectedCustomer, supabase]);

  const loadCustomerResponses = useCallback(async () => {
    if (!selectedCustomer) return;
    try {
      const { data, error } = await supabase
        .from('customer_responses')
        .select(`*, question_templates (template_name, question_text), companies (name)`) // join
        .eq('customer_id', selectedCustomer.id)
        .order('responded_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      setCustomerResponses(data || []);
    } catch (err) {
      // 에러 무시(간단 처리)
    }
  }, [selectedCustomer, supabase]);

  // 고객 응답 제출
  const submitResponse = useCallback(
    async (notificationId: any, responseType: any, value: any, textResponse = '') => {
      try {
        setLoading(true);
        const responseData: any = {
          notification_schedule_id: notificationId,
          customer_id: selectedCustomer.id,
          response_type: responseType,
          responded_at: new Date().toISOString(),
        };
        if (responseType === 'option_selected') {
          responseData.selected_option = value;
        } else if (responseType === 'text_input') {
          responseData.text_response = textResponse;
        } else if (responseType === 'scale_value') {
          responseData.scale_value = value;
        }
        // Find the notification details
        const notification = notifications.find((n: any) => n.id === notificationId);
        if (notification) {
          responseData.prescription_id = notification.prescription_id;
          responseData.company_id = notification.company_id;
          responseData.question_template_id = notification.question_template_id;
        }
        const { error } = await supabase
          .from('customer_responses')
          .insert([responseData]);
        if (error) throw error;
        // Remove from pending notifications
        setNotifications((prev) => prev.filter((n: any) => n.id !== notificationId));
        // Reload customer responses
        loadCustomerResponses();
        // 성공 메시지 등은 필요시 추가
      } catch (err) {
        // 에러 무시(간단 처리)
      } finally {
        setLoading(false);
      }
    },
    [selectedCustomer, notifications, loadCustomerResponses, supabase]
  );

  return (
    <div className="space-y-6">
      {/* Customer Selection */}
      <Card>
        <CardHeader>
          <CardTitle>고객 선택</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCustomer?.id?.toString()} onValueChange={(value) => {
            const customer = customers.find((c: any) => c.id.toString() === value);
            setSelectedCustomer(customer);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="고객을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer: any) => (
                <SelectItem key={customer.id} value={customer.id.toString()}>
                  {customer.name} ({customer.phone})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔔 건강 체크 알림
          </CardTitle>
          <CardDescription>
            약국에서 보낸 건강 체크 질문에 응답해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification: any) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onRespond={submitResponse}
                  loading={loading}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-muted-foreground">
                {loading ? '로딩 중...' : '새로운 알림이 없습니다!'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Response History */}
      <Card>
        <CardHeader>
          <CardTitle>나의 응답 기록</CardTitle>
          <CardDescription>지금까지의 건강 체크 응답 이력입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {customerResponses.length > 0 ? (
            <div className="space-y-3">
              {customerResponses.map((response: any) => (
                <Card key={response.id} className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-green-600">
                          ✓ {response.selected_option || response.text_response || `점수: ${response.scale_value}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {response.question_templates?.template_name} - {response.companies?.name}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(response.responded_at).toLocaleString('ko-KR')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {loading ? '로딩 중...' : '아직 응답 기록이 없습니다.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
