import "github-markdown-css/github-markdown.css"
export default function MarkdownLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
