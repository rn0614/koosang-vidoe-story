'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { createClient } from '@/shared/lib/supabase/client';
import { useToast } from '@/shared/hooks/use-toast';
import { useUpdateQuestionTemplate } from '@/features/alarm/hooks/useUpdateQuestionTemplate';
import { useDeleteQuestionTemplate } from '@/features/alarm/hooks/useDeleteQuestionTemplate';

export default function NotificationSchedulePage() {
  const { scheduleId } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const updateMutation = useUpdateQuestionTemplate();
  const deleteMutation = useDeleteQuestionTemplate();

  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);

  // 상세 조회
  useEffect(() => {
    const fetchTemplate = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('question_templates')
        .select('*')
        .eq('id', scheduleId)
        .neq('delete_yn', true)
        .single();
      setLoading(false);
      if (error) {
        toast({
          title: '오류',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setTemplate(data);
        setEditForm(data);
      }
    };
    if (scheduleId) fetchTemplate();
  }, [scheduleId, supabase, toast]);

  // 삭제
  const handleDelete = async () => {
    if (!window.confirm('정말로 삭제하시겠습니까?')) return;
    setEditLoading(true);
    deleteMutation.mutate(Number(scheduleId), {
      onSuccess: () => {
        setEditLoading(false);
        toast({
          title: '삭제 완료',
          description: '질문 템플릿이 삭제되었습니다.',
        });
        router.back();
      },
      onError: (error: any) => {
        setEditLoading(false);
        toast({
          title: '오류',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  // 수정
  const handleEditFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setEditForm((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleEditOptionsChange = (index: number, value: string) => {
    setEditForm((prev: any) => ({
      ...prev,
      options: prev.options.map((opt: string, i: number) =>
        i === index ? value : opt,
      ),
    }));
  };
  const handleEditActiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm((prev: any) => ({ ...prev, is_active: e.target.checked }));
  };
  const handleEditSave = async () => {
    setEditLoading(true);
    updateMutation.mutate(
      {
        id: Number(scheduleId),
        template_name: editForm.template_name,
        question_text: editForm.question_text,
        options: editForm.options,
        schedule_type: editForm.schedule_type,
        schedule_time: editForm.schedule_time,
        is_active: editForm.is_active,
      },
      {
        onSuccess: (data) => {
          setEditLoading(false);
          toast({
            title: '수정 완료',
            description: '질문 템플릿이 수정되었습니다.',
          });
          setTemplate({ ...template, ...editForm });
        },
        onError: (error: any) => {
          setEditLoading(false);
          toast({
            title: '오류',
            description: error.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  if (loading) return <div className="p-8 text-center">로딩 중...</div>;
  if (!template)
    return <div className="p-8 text-center">템플릿을 찾을 수 없습니다.</div>;

  return (
    <Card className="w-full max-w-xl">
      <CardContent className="space-y-6 pt-6">
        <h1 className="mb-2 text-2xl font-bold">질문 템플릿 상세/수정</h1>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block">템플릿 이름</label>
            <input
              className="w-full rounded border p-2"
              name="template_name"
              value={editForm.template_name}
              onChange={handleEditFormChange}
            />
          </div>
          <div>
            <label className="mb-1 block">질문 내용</label>
            <textarea
              className="w-full rounded border p-2"
              name="question_text"
              value={editForm.question_text}
              onChange={handleEditFormChange}
            />
          </div>
          <div>
            <label className="mb-1 block">선택지</label>
            {editForm.options &&
              editForm.options.map((option: string, idx: number) => (
                <input
                  key={idx}
                  className="mb-2 w-full rounded border p-2"
                  value={option}
                  onChange={(e) => handleEditOptionsChange(idx, e.target.value)}
                />
              ))}
          </div>
          <div>
            <label className="mb-1 block">활성화 상태</label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!editForm.is_active}
                onChange={handleEditActiveChange}
              />
              <span>{editForm.is_active ? 'Active' : 'Inactive'}</span>
            </label>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleEditSave} disabled={editLoading}>
              {editLoading ? '저장 중...' : '저장'}
            </Button>
            <Button
              onClick={handleDelete}
              variant="destructive"
              disabled={editLoading}
            >
              삭제
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
