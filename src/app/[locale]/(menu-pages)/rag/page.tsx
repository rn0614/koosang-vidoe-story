import DocumentList from '@/features/rag/components/document';

export default function Page() {
  return (
    <div className="mx-auto w-full p-4">
      <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
        RAG 적용 노트
      </h3>
      <DocumentList />
    </div>
  );
}
