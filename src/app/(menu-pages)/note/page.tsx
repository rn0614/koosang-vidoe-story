'use client';
import { useState } from 'react';
import { useNotes } from '@/app/hooks/useNotes';
import { NoteInsertFormData } from '@/type/note';
import NoteEditDialog from '@/app/components/NoteEditDialog';
import { UUID } from 'crypto';
export default function NotePage() {
  const {
    notes,
    loading,
    error,
    addNote,
    updateNote,
    register,
    errors,
    handleSubmit,
  } = useNotes();

  // 모달 상태
  const [editNote, setEditNote] = useState<{ id: UUID; title: string } | null>(
    null,
  );
  const [editTitle, setEditTitle] = useState('');

  // 노트 추가 후 목록 갱신
  const handleSubmitNote = async (data: NoteInsertFormData) => {
    await addNote(data);
  };

  // 수정 모달 열기
  const openEditModal = (note: { id: UUID; title: string }) => {
    setEditNote(note);
    setEditTitle(note.title);
  };

  // 수정 모달 닫기
  const closeEditModal = () => {
    setEditNote(null);
    setEditTitle('');
  };

  // 수정 제출 핸들러
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateNote(editNote?.id!, editTitle);
    closeEditModal();
  };

  return (
    <div style={{ background: 'var(--bg-main)', color: 'var(--text-main)' }}>
      <div className="mx-auto">
        <form
          onSubmit={handleSubmit(handleSubmitNote)}
          className="mb-6 flex gap-2"
        >
          <input
            {...register('title', {
              required: '제목을 입력하세요.',
              minLength: {
                value: 3,
                message: '제목은 3글자 이상이어야 합니다.',
              },
            })}
            type="text"
            placeholder="제목"
            className="flex-1 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? '추가 중...' : '노트 추가'}
          </button>
        </form>
        {errors.title && (
          <div className="mb-2 text-sm text-red-500">
            {errors.title.message}
          </div>
        )}
        {(error as Error) && (
          <div className="mb-2 text-sm text-red-500">
            {error instanceof Error
              ? error.message
              : '알 수 없는 오류가 발생했습니다'}
          </div>
        )}
        {/* 노트 목록 출력 */}
        <div className="rounded bg-white p-4 dark:bg-gray-900">
          <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
            노트 목록
          </h3>
          {notes.length === 0 ? (
            <div className="text-gray-400 dark:text-gray-500">
              노트가 없습니다.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {notes.map((note) => (
                <li
                  key={note.id}
                  className="flex cursor-pointer items-center justify-between rounded py-2 text-gray-900 transition-colors hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800"
                >
                  <span>{note.title}</span>
                  <NoteEditDialog
                    note={note}
                    editTitle={editTitle}
                    onEditTitleChange={setEditTitle}
                    onEditSubmit={handleEditSubmit}
                    onClose={closeEditModal}
                    isOpen={editNote?.id === note.id}
                    onOpenChange={(open) => {
                      if (!open) {
                        closeEditModal();
                      } else {
                        openEditModal(note);
                      }
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
