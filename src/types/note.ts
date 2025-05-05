import { UUID } from 'crypto';

// app/types/note.ts
export type Note = {
  id: UUID;
  title: string;
  created_at: string; // ISO 문자열 형식으로 변경
  updated_at: string; // ISO 문자열 형식으로 변경
};

// id만 제외한 타입
export type NoteInsertFormData = Omit<Note, 'id' | 'created_at' | 'updated_at'>;

// id만 제외한 타입
export type NoteUpdateFormData = Omit<Note, 'created_at' | 'updated_at'>;
