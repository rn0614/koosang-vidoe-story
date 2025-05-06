import { getAllContentFiles, getCategorys } from '@/lib/content';
import { Link } from '@/i18n/navigation';
import path from 'path';

export default async function BlogPage() {
  const contentDir = path.join(process.cwd(), 'posts');
  const allFiles = getAllContentFiles(contentDir);
  const categorys = getCategorys();
  return (
    <div className="mx-auto w-full rounded bg-white p-4 dark:bg-gray-900">
      <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
        노트 목록
      </h3>
      <div>
        {categorys.map((category) => (
          <Link href={`/blog/${category}`}>{category}</Link>
        ))}
      </div>

      {allFiles.length === 0 ? (
        <div className="text-gray-400 dark:text-gray-500">노트가 없습니다.</div>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {allFiles.map((file) => (
            <li
              key={file}
              className="cursor-pointer rounded transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Link
                href={`/blog/${file}`}
                className="block w-full max-w-[400px] overflow-hidden text-ellipsis whitespace-nowrap px-3 py-2 text-gray-900 dark:text-gray-100 sm:max-w-[450px] md:max-w-[600px] lg:max-w-[700px]"
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

export const dynamic = 'force-static';
