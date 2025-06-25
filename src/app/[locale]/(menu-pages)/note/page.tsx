'use client';
import { useState } from 'react';
import { useNotes } from '@/hooks/useNotes';
import { Note, NoteInsertFormData } from '@/shared/types/note';
import NoteEditDialog from '@/components/note/note-edit0dialog';
import { useTranslations } from 'next-intl';


export default function NotePage() {
  const t = useTranslations('note_edit');
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

  // 상태: 현재 수정할 노트
  const [editNote, setEditNote] = useState<Note | null>(null);

  // 노트 추가 후 목록 갱신
  const handleSubmitNote = async (data: NoteInsertFormData) => {
    await addNote(data);
  };

  // 수정 제출 핸들러
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateNote(editNote?.id!, editNote?.title!);
    setEditNote(null);
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
                  <span className="block w-full max-w-[400px] overflow-hidden text-ellipsis whitespace-nowrap px-3 py-2 text-gray-900 dark:text-gray-100 sm:max-w-[450px] md:max-w-[600px] lg:max-w-[700px]">
                    {note.title}
                  </span>
                  <button
                    className="ml-2 rounded bg-yellow-500 px-2 py-1 text-xs text-white hover:bg-yellow-600"
                    type="button"
                    onClick={() => setEditNote(note)}
                  >
                    {t('edit')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* 공통 Dialog (한 번만) */}
        <NoteEditDialog
          note={editNote}
          isOpen={!!editNote}
          onClose={() => setEditNote(null)}
          onEditSubmit={handleEditSubmit}
          editTitle={editNote?.title || ''}
          onEditTitleChange={(value) => {
            if (!editNote) return;
            setEditNote({ ...editNote, title: value });
          }}
          onOpenChange={(open) => setEditNote(open ? editNote : null)}
        />
      </div>
    </div>
  );
}
