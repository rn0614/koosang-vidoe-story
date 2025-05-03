import { MDXRemote } from 'next-mdx-remote/rsc';

export default async function RemoteMdxPage() {
  // MDX text - can be from a database, CMS, fetch, anywhere...
  const res = await fetch('https://...');
  const markdown = await res.text();
  return <MDXRemote source={markdown} />;
}
