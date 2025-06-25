'use client';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { NoteUpdateFormData } from '@/shared/types/note';
import { Button } from "@/components/ui/button"
import { useTranslations } from 'next-intl';
interface NoteEditDialogProps {
  note: NoteUpdateFormData|null;
  editTitle: string;
  onEditTitleChange: (value: string) => void;
  onEditSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NoteEditDialog({
  note,
  editTitle,
  onEditTitleChange,
  onEditSubmit,
  onClose,
  isOpen,
  onOpenChange,
}: NoteEditDialogProps) {
  const t = useTranslations('note_edit');
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onEditSubmit} className="mt-4 flex flex-col gap-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => onEditTitleChange(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            minLength={3}
            required
          />
          <DialogFooter className="mt-2 flex justify-end gap-2">
            <DialogClose asChild>
              <Button
                type="button"
                className="rounded bg-gray-300 px-3 py-1 text-gray-800 hover:bg-gray-400"
                onClick={onClose}
              >
                {t('cancel')}
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
            >
              {t('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
