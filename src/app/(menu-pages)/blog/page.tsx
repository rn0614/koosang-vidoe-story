import { getAllContentFiles } from '@/lib/content';
import Link from 'next/link';
import path from 'path';

export default function BlogPage() {
  const contentDir = path.join(process.cwd(), 'content', 'posts');
  const allFiles = getAllContentFiles(contentDir);
  return (
    <div className="rounded bg-white p-4 dark:bg-gray-900">
      <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
        노트 목록
      </h3>
      {allFiles.length === 0 ? (
        <div className="text-gray-400 dark:text-gray-500">노트가 없습니다.</div>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {allFiles.map((file) => (
            <li
              key={file}
              className="rounded transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Link
                href={`/blog/${file}`}
                className="block w-full px-3 py-2 text-gray-900 dark:text-gray-100"
              >
                {file}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
