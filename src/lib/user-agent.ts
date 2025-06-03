'use server';
import { headers } from 'next/headers';

export async function detectPlatform(): Promise<'mobile' | 'webview' | 'web'> {
  const userAgent = (await headers()).get('user-agent') || '';
  console.log('userAgent', userAgent);
  // WebView 감지 요소들
  const isWebView = /wv\)/.test(userAgent);
  console.log('isWebView', isWebView);
  // 모바일 감지
  const isMobile = /Mobile/i.test(userAgent);


  return (
    isWebView ? 'webview' :
    isMobile ? 'mobile' :
    'web'
  );
}