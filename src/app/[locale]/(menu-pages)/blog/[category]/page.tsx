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
import ListPagination from '@/components/list-pagination';
import { useSearchParams } from 'next/navigation';

type PostMeta = {
  slug: string;
  title?: string;
  excerpt?: string;
  description?: string;
  tags?: string[];
  thumnail?: string; // 오타 주의, 실제로는 thumbnail로 쓰는 게 좋음
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
};

const PAGE_SIZE = 8; // 한 페이지에 보여줄 포스트 개수

export default async function CategoryPage({
  params,
  searchParams,
  ...props
}: {
  params: Promise<{ category: string }>;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const param = await params;
  console.log('param12', param);
  const category = param.category;
  const contentDir = path.join(
    process.cwd(),
    'posts',
    decodeURIComponent(category),
  );
  const allPosts: PostMeta[] = getAllContentWithMeta(contentDir);

  // 페이지네이션 관련 계산
  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / PAGE_SIZE);

  const page =
    typeof searchParams?.page === 'string'
      ? parseInt(searchParams.page, 10)
      : 1;

  // 현재 페이지에 해당하는 포스트만 추출
  const startIdx = (page - 1) * PAGE_SIZE;
  const endIdx = startIdx + PAGE_SIZE;
  const postsToShow = allPosts.slice(startIdx, endIdx);

  return (
    <div className="mx-auto w-full rounded bg-white p-4 dark:bg-gray-900">
      <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
        노트 목록
      </h3>
      {postsToShow.length === 0 ? (
        <div className="text-gray-400 dark:text-gray-500">노트가 없습니다.</div>
      ) : (
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {postsToShow.map((post) =>
              post ? (
                <Card key={post.slug} className="md:max-w-full">
                  <Link href={`/blog/${post.slug}`}>
                    <CardHeader>
                      <CardTitle className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {post.title || post.slug}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex aspect-[5/4] w-full items-center justify-center overflow-hidden bg-gray-800">
                        <Image
                          src={
                            post.thumnail
                              ? post.thumnail
                              : '/image/no-image-found.png'
                          }
                          alt={post.title || post.slug}
                          width={300}
                          height={240}
                          className="h-full w-full object-cover"
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
          <ListPagination
            listName="blog"
            currentPage={page}
            totalPages={totalPages}
            category={category}
          />
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
