import "github-markdown-css/github-markdown.css";
import "./markdown-theme.css"; // 위에서 만든 파일
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
