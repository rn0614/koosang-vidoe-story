import remarkGfm from 'remark-gfm';
import createMDX from '@next/mdx';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';
import bundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify:true,
  compiler:{
    removeConsole: process.env.NODE_ENV === 'production' && {
      exclude: ['error', 'warn']
    }
  },
  // src 디렉토리 사용 설정
  distDir: '.next',
  // Configure `pageExtensions`` to include MDX files
  pageExtensions: ['js', 'jsx', 'mdx', 'md', 'ts', 'tsx'],
  // Optionally, add any other Next.js config below
  images: {
    domains: ['images.unsplash.com', 'xhnluxkxxazrklnvnoot.supabase.co'],
    
  },
  experimental: {
    outputFileTracingIncludes: {
      '../src/shared/lib/content.ts': ['../../posts/**'],
      '../../src/shared/lib/content.ts': ['../../../posts/**'],
      [path.resolve('src/shared/lib/content.ts')]: [path.resolve('posts/**')],
    },
  },
};

// intl 플러그인
const withNextIntl = createNextIntlPlugin('./src/shared/lib/i18n/request.ts');

// mdx 플러그인
const withMDX = createMDX({
  // Add markdown plugins here, as desired
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
  },
});

// 번들 분석 플러그인
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// Wrap MDX and Next.js config with each other
export default withMDX(withNextIntl(withBundleAnalyzer(nextConfig)));
