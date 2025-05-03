import Link from 'next/link';

export default async function Home() {
  return (
    <main className="flex flex-1 flex-col gap-6 px-4">
      <h1 className="mb-4 text-xl font-medium">Next steps</h1>
      <p>할 수 있는 nextjs</p>
      <Link href="/blog">블로그 바로가기</Link>
      <Link href="/game">게임 바로가기</Link>
      <Link href="/note">노트 바로가기</Link>
    </main>
  );
}
