import { getAllContentFiles, getContentData } from '@/lib/content';
import path from 'path';
import { Metadata } from 'next';
import MdxRenderer from '@/components/mdx-remote-comp';
import { routing } from '@/i18n/routing';

export default async function BlogPage({
  params,
}: {
  params: Promise<{ category: string; slug: string[] }>;
}) {
  const param = await params;
  const { category, slug } = param;
  const decodeSlug = [category, ...slug]
    .map((slug) => decodeURIComponent(slug))
    .join(path.sep);
  const post = await getContentData(decodeSlug);

  return (
    <article className="px-4 py-8">
      <h1 className="mb-4 text-4xl font-bold">{post.title}</h1>
      {post.date && (
        <time className="text-gray-500">
          {new Date(post.date).toLocaleDateString()}
        </time>
      )}
      {post.description && (
        <p className="mt-2 text-gray-600">{post.description}</p>
      )}
      <div className="markdown-body">
        <MdxRenderer source={post.content} />
      </div>
    </article>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string[] }>;
}): Promise<Metadata> {
  const param = await params;
  const { category, slug } = param;
  const decodeSlug = [category, ...slug].map(decodeURIComponent).join('/');
  const post = await getContentData(decodeSlug);

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

export function generateStaticParams() {
  const contentDir = path.join(process.cwd(), 'posts');
  const allFiles = getAllContentFiles(contentDir);

  return routing.locales.flatMap((locale) =>
    allFiles.map((file) => {
      const [category, ...slug] = file.split('/');
      return {
        locale,
        category,
        slug,
      };
    }),
  );
}

export const dynamicParams = false;
export const dynamic = 'force-static';
