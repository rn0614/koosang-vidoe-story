import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';

export type ContentFile = {
  slug: string;
  title: string;
  date?: string;
  description?: string;
  content: string;
  [key: string]: string | MDXRemoteSerializeResult | undefined;
};

export function getCategorys() {
  return ['100 Resources', 'test'];
}

export function getAllContentFiles(
  dir?: string,
  fileList: string[] = [],
  options: {
    exclude?: {
      paths?: string[];
      files?: string[];
    };
  } = {},
): string[] {
  const contentDir = dir || path.join(process.cwd(), 'posts');

  const files = fs.readdirSync(contentDir);

  files.forEach((file) => {
    const filePath = path.join(contentDir, file);
    const stat = fs.statSync(filePath);

    // 제외할 경로 체크
    const relativePath = path.relative(contentDir, filePath);
    const shouldExcludePath = options.exclude?.paths?.some((excludePath) =>
      relativePath.toLowerCase().startsWith(excludePath.toLowerCase()),
    );

    // 제외할 파일 체크
    const shouldExcludeFile = options.exclude?.files?.some(
      (excludeFile) => file.toLowerCase() === excludeFile.toLowerCase(),
    );

    if (stat.isDirectory()) {
      if (!shouldExcludePath) {
        getAllContentFiles(filePath, fileList, options);
      }
    } else if (
      (file.endsWith('.md') || file.endsWith('.mdx')) &&
      !shouldExcludeFile &&
      !shouldExcludePath
    ) {
      // content/posts 폴더를 기준으로 상대 경로를 계산하고 소문자로 변환
      const baseDir = path.join(process.cwd(), 'posts');
      const relativePath = path.relative(baseDir, filePath);
      const slug = relativePath
        .replace(/\.(md|mdx)$/, '')
        .split(path.sep)
        .join('/');

      // 이미 존재하는 slug와 대소문자만 다른 경우 건너뛰기
      const existingSlug = fileList.find(
        (s) => s.toLowerCase() === slug.toLowerCase(),
      );
      if (!existingSlug) {
        fileList.push(slug);
      }
    }
  });
  return fileList;
}

export async function getContentData(slug: string): Promise<ContentFile> {
  // 슬래시를 시스템 경로 구분자로 변환
  const normalizedSlug = slug
    .split(path.sep)
    .map((part) => decodeURIComponent(part))
    .join(path.sep);

  // content/posts 디렉토리를 포함한 전체 경로로 수정
  const fullPath = path.join(process.cwd(), 'posts', normalizedSlug + '.md');

  const fileContents = fs.readFileSync(fullPath, { encoding: 'utf8' });

  // gray-matter로 frontmatter와 content 분리
  const { data, content } = matter(fileContents);

  return {
    slug,
    content,
    ...data,
    title:
      data.title ||
      path
        .basename(slug)
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase()),
  };
}

export async function getSortedContentData(
  dir: string = 'posts',
): Promise<ContentFile[]> {
  const contentDir = path.join(process.cwd(), dir);
  const fileNames = getAllContentFiles(contentDir);

  const allContentData = await Promise.all(
    fileNames.map(async (slug) => {
      try {
        // content 폴더를 포함한 전체 경로로 수정
        return getContentData(slug);
      } catch (error) {
        console.error(`Error processing file ${slug}:`, error);
        return null;
      }
    }),
  );

  // null 값 필터링
  const validContentData = allContentData.filter(
    (data): data is ContentFile => data !== null,
  );

  return validContentData.sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export function getAllContentWithMeta(
  dir?: string,
  options: {
    exclude?: {
      paths?: string[];
      files?: string[];
    };
  } = {},
) {
  const fileSlugs = getAllContentFiles(dir, [], options);
  const posts = fileSlugs
    .map((slug) => {
      // 항상 posts 기준으로 경로 생성
      const mdPath = path.join(process.cwd(), 'posts', slug + '.md');
      if (!fs.existsSync(mdPath)) {
        throw new Error(`File not found: ${mdPath}`);
      }
      const file = fs.readFileSync(mdPath, { encoding: 'utf-8' });
      const { content, data } = matter(file);
      // title이 없으면 slug에서 파일명만 추출해서 .md 확장자 제거 후 title로 사용
      let title = data.title;
      if (!title) {
        const slugParts = slug.split('/');
        title = slugParts[slugParts.length - 1].replace(/\.md$/, '');
      }
      return {
        slug,
        ...data,
        title,
        tags: data.tags?.filter(Boolean) || [],
        content,
      };
    })
    .filter(Boolean);
  return posts;
}
