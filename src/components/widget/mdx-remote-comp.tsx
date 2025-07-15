import { getSupabaseImageUrl } from "@/utils/utils";
import { MDXRemote } from "next-mdx-remote/rsc";

// Excalidraw 임베드 컴포넌트
function ExcalidrawEmbed({ filename }: { filename: string }) {
  // 파일명을 기반으로 excalidraw URL 생성 (실제 구현에 맞게 수정 필요)
  const excalidrawUrl = `https://excalidraw.com/#json=${encodeURIComponent(filename)}`;
  
  return (
    <div style={{ width: '100%', height: '400px', border: '1px solid #ccc', margin: '16px 0' }}>
      <iframe
        src={excalidrawUrl}
        width="100%"
        height="100%"
        frameBorder="0"
        title={`Excalidraw: ${filename}`}
      />
    </div>
  );
}

// MDX 소스에서 ![[파일명]] 패턴을 처리하는 함수
function preprocessExcalidraw(source: string): string {
  // ![[파일명]] 패턴을 찾아서 ExcalidrawEmbed 컴포넌트로 변환
  return source.replace(/!\[\[([^\]]+)\]\]/g, (match, filename) => {
    // excalidraw 파일인지 확인 (확장자 또는 특정 패턴으로)
    if (filename.includes('excalidraw') || filename.endsWith('.excalidraw')) {
      return `<ExcalidrawEmbed filename="${filename}" />`;
    }
    // excalidraw가 아닌 경우 원본 그대로 반환
    return match;
  });
}

const components = {
  ExcalidrawEmbed, // 커스텀 컴포넌트 추가
  img: (props: any) => {
    const src = props.src.startsWith('http')
      ? props.src
      : getSupabaseImageUrl('rag-image', props.src.split('/').pop()!);
    return <img {...props} src={src} loading="lazy" alt={props.alt || ""} />;
  },
  a: (props: any) => {
    // href가 없는 경우 처리
    if (!props.href) {
      return <a {...props} />;
    }
    
    // 절대 경로인 경우 (http:// 또는 https://로 시작)
    if (props.href.startsWith('http://') || props.href.startsWith('https://')) {
      return <a {...props} rel={props.href.startsWith('http') ? "noopener noreferrer" : undefined} />;
    }
    
    // 상대 경로인 경우
    let href = props.href;
    // .md 확장자 제거
    if (href.endsWith('.md')) {
      href = href.slice(0, -3);
    }
    // 맨 앞에 / 추가 (이미 있는 경우 제외)
    if (!href.startsWith('/')) {
      href = `/${href}`;
    }
    
    return <a {...props} href={href} />;
  },
  h1:(props:any) => <h1 {...props} style={{fontSize: '2rem', fontWeight: 'bold'}}/>,
  h2:(props:any) => <h2 {...props} style={{fontSize: '1.5rem', fontWeight: 'bold'}}/>,
  h3:(props:any) => <h3 {...props} style={{fontSize: '1.25rem', fontWeight: 'bold'}}/>,
  h4:(props:any) => <h4 {...props} style={{fontSize: '1rem', fontWeight: 'bold'}}/>,
  h5:(props:any) => <h5 {...props} style={{fontSize: '0.875rem', fontWeight: 'bold'}}/>,
  h6:(props:any) => <h6 {...props} style={{fontSize: '0.75rem', fontWeight: 'bold'}}/>,
  pre:(props:any) => <pre {...props} style={{overflowX:'scroll'}}/>
};

export default function MdxRenderer({
  source,
}: {
  source: string;
}) {
  // excalidraw 임베딩 전처리
  const processedSource = preprocessExcalidraw(source);
  
  return (
    <MDXRemote source={processedSource} components={components}/>
  );
}
