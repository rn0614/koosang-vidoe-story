import MdxRenderer from '@/components/mdx-remote-comp';

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
