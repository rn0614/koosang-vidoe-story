"use client"

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useUpdateQuestionTemplate } from '@/hooks/useUpdateQuestionTemplate';
import { useDeleteQuestionTemplate } from '@/hooks/useDeleteQuestionTemplate';

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
  const [editMode, setEditMode] = useState(false);
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
        toast({ title: '오류', description: error.message, variant: 'destructive' });
      } else {
        setTemplate(data);
        setEditForm(data);
      }
    };
    if (scheduleId) fetchTemplate();
  }, [scheduleId, supabase, toast]);

  // 삭제 (Soft Delete)
  const handleDelete = async () => {
    if (!window.confirm(`정말로 삭제하시겠습니까? ${scheduleId}`)) return;
    setEditLoading(true);
    deleteMutation.mutate(Number(scheduleId), {
      onSuccess: () => {
        setEditLoading(false);
        toast({ title: '삭제 완료', description: '질문 템플릿이 삭제되었습니다.' });
        router.back();
      },
      onError: (error: any) => {
        setEditLoading(false);
        toast({ title: '오류', description: error.message, variant: 'destructive' });
      },
    });
  };

  // 수정
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleEditOptionsChange = (index: number, value: string) => {
    setEditForm((prev: any) => ({
      ...prev,
      options: prev.options.map((opt: string, i: number) => (i === index ? value : opt)),
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
          toast({ title: '수정 완료', description: '질문 템플릿이 수정되었습니다.' });
          setEditMode(false);
          setTemplate({ ...template, ...editForm });
        },
        onError: (error: any) => {
          setEditLoading(false);
          toast({ title: '오류', description: error.message, variant: 'destructive' });
        },
      }
    );
  };

  if (loading) return <div className="p-8 text-center">로딩 중...</div>;
  if (!template) return <div className="p-8 text-center">템플릿을 찾을 수 없습니다.</div>;

  return (
    <Dialog open={true} onOpenChange={() => router.back()}>
      <DialogContent>
        <Card className="w-full max-w-xl">
          <CardContent className="pt-6 space-y-6">
            <h1 className="text-2xl font-bold mb-2">질문 템플릿 상세2</h1>
            {!editMode ? (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-lg">{template.template_name}</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {template.is_active ? 'active' : 'inactive'}
                  </Badge>
                </div>
                <div className="mb-2 text-muted-foreground">{template.question_text}</div>
                {template.options && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {template.options.map((option: string, idx: number) => (
                      <Badge key={idx} variant="outline">{option}</Badge>
                    ))}
                  </div>
                )}
                <div className="mb-2 text-sm text-muted-foreground">
                  주기: {template.schedule_type} / 시간: {template.schedule_time}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => setEditMode(true)} variant="secondary">수정</Button>
                  <Button onClick={handleDelete} variant="destructive" disabled={editLoading}>삭제</Button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block mb-1">템플릿 이름</label>
                  <input
                    className="w-full border rounded p-2"
                    name="template_name"
                    value={editForm.template_name}
                    onChange={handleEditFormChange}
                  />
                </div>
                <div>
                  <label className="block mb-1">질문 내용</label>
                  <textarea
                    className="w-full border rounded p-2"
                    name="question_text"
                    value={editForm.question_text}
                    onChange={handleEditFormChange}
                  />
                </div>
                <div>
                  <label className="block mb-1">선택지</label>
                  {editForm.options && editForm.options.map((option: string, idx: number) => (
                    <input
                      key={idx}
                      className="w-full border rounded p-2 mb-2"
                      value={option}
                      onChange={e => handleEditOptionsChange(idx, e.target.value)}
                    />
                  ))}
                </div>
                <div>
                  <label className="block mb-1">활성화 상태</label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!editForm.is_active}
                      onChange={handleEditActiveChange}
                    />
                    <span>{editForm.is_active ? 'Active' : 'Inactive'}</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleEditSave} disabled={editLoading}>
                    {editLoading ? '저장 중...' : '저장'}
                  </Button>
                  <Button variant="outline" onClick={() => setEditMode(false)}>
                    취소
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}