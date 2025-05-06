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

export function getCategorys(){
  return ['100resources', 'test']
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
        .toLowerCase()
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
  })
  return fileList;
}

export async function getContentData(slug: string): Promise<ContentFile> {
  // 슬래시를 시스템 경로 구분자로 변환
  const normalizedSlug = slug.split('/').join(path.sep);

  // content/posts 디렉토리를 포함한 전체 경로로 수정
  const fullPath = path.join(process.cwd(), 'posts', normalizedSlug + '.md');

  // 파일이 존재하는지 확인
  if (!fs.existsSync(fullPath)) {
    // 파일을 찾지 못한 경우, 대소문자 구분 없이 디렉토리를 검색
    const contentDir = path.join(process.cwd(), 'posts');
    const allFiles = getAllContentFiles(contentDir);

    // 대소문자를 구분하지 않고 일치하는 파일 찾기
    const matchingFile = allFiles.find(
      (file) => file.toLowerCase() === slug.toLowerCase(),
    );

    if (matchingFile) {
      // 찾은 파일의 실제 경로를 사용
      const actualPath = path.join(
        process.cwd(),
        'posts',
        matchingFile + '.md',
      );
      if (fs.existsSync(actualPath)) {
        return getContentData(matchingFile);
      }
    }

    throw new Error(`getContentData File not found: ${fullPath}`);
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');

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
