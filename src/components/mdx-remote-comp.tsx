import { MDXRemote } from "next-mdx-remote/rsc";
const components = {
  img: (props: any) => <img {...props} src={props.src.replace("public", "")} loading="lazy" alt={props.alt || ""}/>, //public 주소만 제외
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
  pre:(props:any) => <pre {...props} style={{overflowX: 'scroll'}}/>
};

export default function MdxRenderer({
  source,
}: {
  source: string;
}) {
  return (
    <MDXRemote source={source} components={components}/>
  );
}
