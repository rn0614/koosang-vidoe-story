import MdxRenderer from '@/components/mdx-remote-comp';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { titleAndId: string } }): Promise<Metadata> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/documents/${decodeURIComponent(params.titleAndId)}`
  );
  const data = await res.json();
  const document = Array.isArray(data.documents)
    ? data.documents[0]
    : data.documents;

  if (!document) {
    return {
      title: '문서를 찾을 수 없습니다.',
      description: '해당 문서를 찾을 수 없습니다.',
    };
  }

  return {
    title: document.metadata.title,
    description: document.metadata.excerpt || 'RAG 문서 상세 페이지',
    openGraph: {
      title: document.metadata.title,
      description: document.metadata.excerpt || 'RAG 문서 상세 페이지',
      type: 'article',
    },
  };
}

export default async function DocumentPage({
  params
}: {
  params: { titleAndId: string };
}) {
  const { titleAndId } = params;

  // titleAndId에서 id 추출 (예: slug--uuid 구조라면)
  // const id = titleAndId.split('--').pop();
  // 만약 titleAndId가 곧 id라면 아래처럼 사용

  // API 라우트 호출
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/documents/${decodeURIComponent(titleAndId)}`,
  );
  const data = await res.json();
  const document = Array.isArray(data.documents)
    ? data.documents[0]
    : data.documents;

  if (!document) return <div>문서를 찾을 수 없습니다.</div>;

  return (
    <>
      <div className="drak markdown-body rounded-lg p-4">
        <h1>{document.metadata.title}</h1>
        <MdxRenderer source={document.content} />
      </div>
    </>
  );
}
