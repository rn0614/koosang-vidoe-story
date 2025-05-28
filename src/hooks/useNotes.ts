import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Note, NoteInsertFormData, NoteUpdateFormData } from '@/types/note';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import { UUID } from 'crypto';

async function fetchNotes(): Promise<Note[]> {
  const res = await fetch('/api/notes');
  const data = await res.json();
  return data.notes || []
}

async function addNote(data: NoteInsertFormData) {
  const res = await fetch('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: data.title }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || '노트 추가 실패');
  }
}

async function updateNote({ id, title }: NoteUpdateFormData) {
  const updated_at = dayjs().toISOString(); // ISO 문자열 형식으로 변환
  const res = await fetch('/api/notes', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, title, updated_at }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || '노트 수정 실패');
  }
}

export function useNotes() {
  const queryClient = useQueryClient();

  // react-hook-form 세팅
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NoteInsertFormData>();

  // GET 노트 목록 불러오기 (react-query)
  const notesQuery = useQuery<Note[]>({
    queryKey: ['notes'],
    queryFn: fetchNotes,
  });

  // POST 노트 추가 mutation
  const addNoteMutation = useMutation({
    mutationFn: addNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      reset();
    },
  });

  // PATCH 노트 수정 mutation
  const updateNoteMutation = useMutation({
    mutationFn: updateNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  return {
    // 쿼리 데이터
    notes: notesQuery.data ?? [],
    loading: notesQuery.isLoading,
    error: notesQuery.error,

    // 폼 관련
    register,
    errors,
    handleSubmit,

    // Mutations (직접 mutateAsync 사용)
    addNote: addNoteMutation.mutateAsync,
    updateNote: (id: UUID, title: string) =>
      updateNoteMutation.mutateAsync({ id, title }),

    // 로딩 상태
    isAdding: addNoteMutation.isLoading,
    isUpdating: updateNoteMutation.isLoading,
  };
}
