import {
  getAllContentFiles,
  getCategorys,
  getAllContentWithMeta,
} from '@/lib/content';
import { Link } from '@/i18n/navigation';
import path from 'path';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';

type PostMeta = {
  slug: string;
  title?: string;
  excerpt?: string;
  description?: string;
  tags?: string[];
  thumnail?: string; // 오타 주의, 실제로는 thumbnail로 쓰는 게 좋음
  date?: string;
  last_modified_at?: string;
  [key: string]: any;
};

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const param = await params;
  const category = param.category;
  const contentDir = path.join(
    process.cwd(),
    'posts',
    decodeURIComponent(category),
  );
  const allPosts: PostMeta[] = getAllContentWithMeta(contentDir);

  return (
    <div className="mx-auto w-full rounded bg-white p-4 dark:bg-gray-900">
      <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
        노트 목록
      </h3>
      {allPosts.length === 0 ? (
        <div className="text-gray-400 dark:text-gray-500">노트가 없습니다.</div>
      ) : (
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {allPosts.map((post) =>
              post ? (
                <Card key={post.slug} className="md:max-w-full">
                  <Link href={`/blog/${post.slug}`}>
                    <CardHeader>
                      <CardTitle className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {post.title || post.slug}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="w-full aspect-[5/4] overflow-hidden flex items-center justify-center bg-gray-800">
                        <Image
                          src={post.thumnail ? post.thumnail : '/image/no-image-found.png'}
                          alt={post.title || post.slug}
                          width={300}
                          height={240}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardDescription>
                        {post.excerpt || post.description || ''}
                      </CardDescription>
                    </CardContent>
                  </Link>
                </Card>
              ) : null,
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export async function generateStaticParams() {
  // 빌드 시점에 posts 폴더를 읽어서 모든 카테고리 반환
  const categorys = getCategorys();
  return categorys.map((category) => ({ category }));
}

export const dynamic = 'force-static';
