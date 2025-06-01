import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/utils/supabase/client';

interface QuestionTemplateCreateFormProps {
  companyId: number | string | undefined;
  onCreated?: () => void;
  loading?: boolean;
}

export function QuestionTemplateCreateForm({ companyId, onCreated, loading }: QuestionTemplateCreateFormProps) {
  const { toast } = useToast();
  const supabase = createClient();
  const [form, setForm] = useState({
    template_name: '',
    question_text: '',
    question_type: 'single_choice',
    options: [''],
    schedule_type: 'daily',
    schedule_time: '09:00',
  });

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };
  const handleOptionChange = (index: number, value: string) => {
    setForm(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }));
  };
  const handleAddOption = () => {
    setForm(prev => ({ ...prev, options: [...prev.options, ''] }));
  };
  const handleRemoveOption = (index: number) => {
    setForm(prev => ({ ...prev, options: prev.options.filter((_, i) => i !== index) }));
  };

  const handleCreate = async () => {
    if (!companyId) return;
    if (!form.template_name || !form.question_text) {
      toast({ title: '오류', description: '템플릿 이름과 질문 내용을 입력해주세요.', variant: 'destructive' });
      return;
    }
    const { error } = await supabase
      .from('question_templates')
      .insert({
        company_id: companyId,
        template_name: form.template_name,
        question_text: form.question_text,
        question_type: form.question_type,
        options: form.options.filter(opt => opt.trim()),
        schedule_type: form.schedule_type,
        schedule_time: form.schedule_time,
        is_active: true,
      });
    if (error) {
      toast({ title: '오류', description: '템플릿 생성에 실패했습니다: ' + error.message, variant: 'destructive' });
    } else {
      setForm({
        template_name: '',
        question_text: '',
        question_type: 'single_choice',
        options: [''],
        schedule_type: 'daily',
        schedule_time: '09:00',
      });
      toast({ title: '성공', description: '질문 템플릿이 성공적으로 생성되었습니다.' });
      onCreated?.();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="template_name">템플릿 이름</Label>
        <Input
          id="template_name"
          value={form.template_name}
          onChange={e => handleChange('template_name', e.target.value)}
          placeholder="예: 혈압약 복용 체크"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="question_text">질문 내용</Label>
        <Textarea
          id="question_text"
          value={form.question_text}
          onChange={e => handleChange('question_text', e.target.value)}
          placeholder="고객에게 보낼 질문을 입력하세요"
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label>질문 유형</Label>
        <Select value={form.question_type} onValueChange={v => handleChange('question_type', v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single_choice">단일 선택</SelectItem>
            <SelectItem value="multiple_choice">다중 선택</SelectItem>
            <SelectItem value="text">텍스트 입력</SelectItem>
            <SelectItem value="scale">점수 척도</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {(form.question_type === 'single_choice' || form.question_type === 'multiple_choice') && (
        <div className="space-y-2">
          <Label>선택지</Label>
          {form.options.map((option, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={option}
                onChange={e => handleOptionChange(index, e.target.value)}
                placeholder={`선택지 ${index + 1}`}
                className="flex-1"
              />
              {form.options.length > 1 && (
                <Button variant="outline" size="sm" onClick={() => handleRemoveOption(index)}>
                  삭제
                </Button>
              )}
            </div>
          ))}
          <Button variant="ghost" size="sm" onClick={handleAddOption}>
            + 선택지 추가
          </Button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>발송 주기</Label>
          <Select value={form.schedule_type} onValueChange={v => handleChange('schedule_type', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">매일</SelectItem>
              <SelectItem value="weekly">매주</SelectItem>
              <SelectItem value="monthly">매월</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="schedule_time">발송 시간</Label>
          <Input
            id="schedule_time"
            type="time"
            value={form.schedule_time}
            onChange={e => handleChange('schedule_time', e.target.value)}
          />
        </div>
      </div>
      <Button onClick={handleCreate} className="w-full" disabled={loading}>
        {loading ? '📤 템플릿 생성중...' : '📤 템플릿 생성'}
      </Button>
    </div>
  );
}
