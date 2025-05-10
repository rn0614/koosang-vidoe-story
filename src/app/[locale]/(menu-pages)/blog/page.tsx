import { getAllContentFiles, getCategorys } from '@/lib/content';
import { Link } from '@/i18n/navigation';
import path from 'path';

export default async function CategoryMainPage() {
  const contentDir = path.join(process.cwd(), 'posts');
  const allFiles = getAllContentFiles(contentDir);
  const categorys = getCategorys();
  return (
    <div className="mx-auto w-full rounded bg-white p-4 dark:bg-gray-900">
      <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
        노트 목록
      </h3>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {categorys.length > 0 &&
          categorys.map((category) => (
            <li
              key={category}
              className="cursor-pointer rounded transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Link href={`/blog/${category}`}>{category}</Link>
            </li>
          ))}
      </ul>
    </div>
  );
}

export const dynamic = 'force-static';
