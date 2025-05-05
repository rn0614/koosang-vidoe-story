import remarkGfm from 'remark-gfm';
import createMDX from '@next/mdx';
import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // src 디렉토리 사용 설정
  distDir: '.next',
  // Configure `pageExtensions`` to include MDX files
  pageExtensions: ['js', 'jsx', 'mdx', 'md', 'ts', 'tsx'],
  // Optionally, add any other Next.js config below
  images: {
    domains: ['images.unsplash.com'],
  },
  experimental: {
    outputFileTracingIncludes: {
      './src/lib/content.ts': ['./posts/*'],
    },
  },
};

const withNextIntl = createNextIntlPlugin();
const withMDX = createMDX({
  // Add markdown plugins here, as desired
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
  },
});

// Wrap MDX and Next.js config with each other
export default withMDX(withNextIntl(nextConfig));
