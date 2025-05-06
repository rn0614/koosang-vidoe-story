import { getAllContentFiles, getCategorys } from '@/lib/content';
import { Link } from '@/i18n/navigation';
import path from 'path';

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const param = (await params);
  const category = param.category;
  const contentDir = path.join(process.cwd(), 'posts', decodeURIComponent(category));
  const allFiles = getAllContentFiles(contentDir);
  
  return (
    <div className="rounded bg-white p-4 dark:bg-gray-900 w-full mx-auto">
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
                className="
                  block w-full px-3 py-2 text-gray-900 dark:text-gray-100
                  overflow-hidden text-ellipsis whitespace-nowrap
                  max-w-[400px] sm:max-w-[450px] md:max-w-[600px] lg:max-w-[700px]
                "
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


export async function generateStaticParams() {
  // 빌드 시점에 posts 폴더를 읽어서 모든 카테고리 반환
  const categorys = getCategorys();
  return categorys.map(category => ({ category }));
}

export const dynamic = 'force-static';