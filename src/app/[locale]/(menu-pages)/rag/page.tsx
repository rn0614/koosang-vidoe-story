'use client';
import { useDocuments } from '@/app/hooks/useDocuments';
import { useSearchParams } from 'next/navigation';
import BlogPagination from '@/components/blog-pagination';
import { Link } from '@/i18n/navigation';

const PAGE_SIZE = 10;

export default function DocumentPage() {
  const { documents } = useDocuments();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const totalPages = Math.ceil(documents.length / PAGE_SIZE);

  const startIdx = (page - 1) * PAGE_SIZE;
  const endIdx = startIdx + PAGE_SIZE;
  const documentsToShow = documents.slice(startIdx, endIdx);

  return (
    <div style={{ background: 'var(--bg-main)', color: 'var(--text-main)' }}>
      <div className="mx-auto">
        <div className="rounded bg-white p-4 dark:bg-gray-900">
          <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
            노트 목록
          </h3>
          {documents.length === 0 ? (
            <div className="text-gray-400 dark:text-gray-500">
              노트가 없습니다.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {documentsToShow.map((document) => (
                <li
                  key={document.id}
                  className="flex cursor-pointer items-center justify-between rounded py-2 text-gray-900 transition-colors hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800"
                >
                  <Link
                    href={`/rag/${document.metadata.title}--${document.id}`}
                    className="block w-full overflow-hidden text-ellipsis whitespace-nowrap px-3 py-2 text-gray-900 dark:text-gray-100"
                  >
                    {document.metadata.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <BlogPagination
            listName="rag"
            currentPage={page}
            totalPages={totalPages}
            category={''}
          />
        </div>
      </div>
    </div>
  );
}
